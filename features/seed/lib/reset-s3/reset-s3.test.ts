import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/client-factory", () => ({
  getS3Client: vi.fn(),
}));

import {
  ListBucketsCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  DeleteBucketCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { getS3Client } from "@/lib/aws/client-factory";
import { resetS3 } from "./reset-s3";

function makeS3Client(sendFn: (cmd: unknown) => Promise<unknown>): S3Client {
  return { send: sendFn } as unknown as S3Client;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── No buckets ───────────────────────────────────────────────────────────────

describe("resetS3 — no buckets", () => {
  it("returns empty arrays when there are no buckets", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListBucketsCommand) return { Buckets: [] };
      return {};
    });
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const result = await resetS3();

    expect(result.deleted).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});

// ─── Single bucket, no objects ────────────────────────────────────────────────

describe("resetS3 — single bucket, empty", () => {
  it("deletes bucket directly when it has no objects", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListBucketsCommand) {
        return { Buckets: [{ Name: "loopback-test-bucket" }] };
      }
      if (cmd instanceof ListObjectsV2Command) {
        return { Contents: [], IsTruncated: false };
      }
      if (cmd instanceof DeleteBucketCommand) {
        return {};
      }
      return {};
    });
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const result = await resetS3();

    // Should NOT call DeleteObjects for empty bucket
    const deleteObjectsCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteObjectsCommand,
    );
    expect(deleteObjectsCalls).toHaveLength(0);

    // Should call DeleteBucket
    const deleteBucketCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteBucketCommand,
    );
    expect(deleteBucketCalls).toHaveLength(1);

    expect(result.deleted).toContain("loopback-test-bucket");
    expect(result.failed).toHaveLength(0);
  });
});

// ─── Pagination: bucket with >1000 objects ────────────────────────────────────

describe("resetS3 — pagination", () => {
  it("paginates ListObjectsV2 across two pages before deleting bucket", async () => {
    const page1Keys = Array.from({ length: 1000 }, (_, i) => ({ Key: `obj-${i}` }));
    const page2Keys = [{ Key: "obj-1000" }, { Key: "obj-1001" }];

    let listCallCount = 0;
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListBucketsCommand) {
        return { Buckets: [{ Name: "loopback-big-bucket" }] };
      }
      if (cmd instanceof ListObjectsV2Command) {
        listCallCount += 1;
        if (listCallCount === 1) {
          return {
            Contents: page1Keys,
            IsTruncated: true,
            NextContinuationToken: "token-page-2",
          };
        }
        return { Contents: page2Keys, IsTruncated: false };
      }
      if (cmd instanceof DeleteObjectsCommand) return { Deleted: [] };
      if (cmd instanceof DeleteBucketCommand) return {};
      return {};
    });
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const result = await resetS3();

    // ListObjectsV2 called twice
    const listCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof ListObjectsV2Command,
    );
    expect(listCalls).toHaveLength(2);

    // Second ListObjectsV2 uses the ContinuationToken from first page
    const secondListInput = (listCalls[1][0] as ListObjectsV2Command).input;
    expect(secondListInput.ContinuationToken).toBe("token-page-2");

    // DeleteObjects called twice (once per page)
    const deleteObjCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteObjectsCommand,
    );
    expect(deleteObjCalls).toHaveLength(2);

    // First batch has 1000 keys
    const firstBatchInput = (deleteObjCalls[0][0] as DeleteObjectsCommand).input;
    expect(firstBatchInput.Delete?.Objects).toHaveLength(1000);

    // Second batch has 2 keys
    const secondBatchInput = (deleteObjCalls[1][0] as DeleteObjectsCommand).input;
    expect(secondBatchInput.Delete?.Objects).toHaveLength(2);

    // DeleteBucket called once AFTER all objects deleted
    const deleteBucketCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteBucketCommand,
    );
    expect(deleteBucketCalls).toHaveLength(1);

    expect(result.deleted).toContain("loopback-big-bucket");
  });
});

// ─── Partial failure ──────────────────────────────────────────────────────────

describe("resetS3 — partial failure", () => {
  it("records failed bucket when deletion throws, continues other buckets", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListBucketsCommand) {
        return {
          Buckets: [
            { Name: "loopback-ok-bucket" },
            { Name: "loopback-fail-bucket" },
          ],
        };
      }
      if (cmd instanceof ListObjectsV2Command) {
        return { Contents: [], IsTruncated: false };
      }
      if (cmd instanceof DeleteBucketCommand) {
        const input = (cmd as DeleteBucketCommand).input;
        if (input.Bucket === "loopback-fail-bucket") {
          throw new Error("Access denied");
        }
        return {};
      }
      return {};
    });
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const result = await resetS3();

    expect(result.deleted).toContain("loopback-ok-bucket");
    expect(result.failed).toContain("loopback-fail-bucket");
  });
});

// ─── Dry-run ──────────────────────────────────────────────────────────────────

describe("resetS3 — dry-run count", () => {
  it("returns count of buckets without deleting anything", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListBucketsCommand) {
        return { Buckets: [{ Name: "a" }, { Name: "b" }] };
      }
      return {};
    });
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const count = await resetS3({ dryRun: true });

    expect(count).toBe(2);
    // Must NOT call any delete commands
    const deleteCalls = mockSend.mock.calls.filter(
      ([cmd]) =>
        cmd instanceof DeleteObjectsCommand || cmd instanceof DeleteBucketCommand,
    );
    expect(deleteCalls).toHaveLength(0);
  });
});
