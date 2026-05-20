import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { captureS3 } from "./capture-s3";

function makeClient(
  sendFn: (cmd: unknown) => Promise<unknown>,
): S3Client {
  return { send: sendFn } as unknown as S3Client;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("captureS3", () => {
  it("happy path — 1 bucket with 2 objects", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListBucketsCommand) {
        return {
          Buckets: [{ Name: "my-assets", CreationDate: new Date() }],
        };
      }
      if (cmd instanceof ListObjectsV2Command) {
        return {
          Contents: [
            {
              Key: "images/logo.png",
              Size: 1024,
              ETag: '"abc123"',
              LastModified: new Date("2024-01-01T00:00:00Z"),
            },
            {
              Key: "docs/readme.txt",
              Size: 512,
              ETag: '"def456"',
              LastModified: new Date("2024-01-02T00:00:00Z"),
            },
          ],
        };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureS3(client);

    expect(result).toHaveLength(1);
    const bucket = result[0];
    expect(bucket.bucketName).toBe("my-assets");
    expect(bucket.objects).toHaveLength(2);

    const logo = bucket.objects.find((o) => o.key === "images/logo.png");
    expect(logo).toBeDefined();
    expect(logo!.size).toBe(1024);
    expect(logo!.etag).toBe('"abc123"');
    expect(logo!.lastModified).toBe("2024-01-01T00:00:00.000Z");
    // ContentType is NOT available from ListObjectsV2 — must always be undefined
    expect(logo!.contentType).toBeUndefined();
  });

  it("empty bucket — objects is empty array", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListBucketsCommand) {
        return {
          Buckets: [{ Name: "empty-bucket", CreationDate: new Date() }],
        };
      }
      if (cmd instanceof ListObjectsV2Command) {
        return { Contents: [] };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureS3(client);

    expect(result).toHaveLength(1);
    expect(result[0].objects).toHaveLength(0);
  });

  it("no GetObject calls are made — metadata only", async () => {
    const getObjectCalled = vi.fn();
    const client = makeClient(async (cmd) => {
      if (cmd instanceof GetObjectCommand) {
        getObjectCalled();
        throw new Error("GetObject should not be called");
      }
      if (cmd instanceof ListBucketsCommand) {
        return {
          Buckets: [{ Name: "assets", CreationDate: new Date() }],
        };
      }
      if (cmd instanceof ListObjectsV2Command) {
        return {
          Contents: [
            {
              Key: "file.bin",
              Size: 8192,
              ETag: '"xyz"',
              LastModified: new Date("2024-06-01T00:00:00Z"),
            },
          ],
        };
      }
      throw new Error("Unexpected command");
    });

    await captureS3(client);

    expect(getObjectCalled).not.toHaveBeenCalled();
  });

  it("paginated listing — fetches all pages until IsTruncated is false", async () => {
    let listCallCount = 0;
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListBucketsCommand) {
        return { Buckets: [{ Name: "big-bucket", CreationDate: new Date() }] };
      }
      if (cmd instanceof ListObjectsV2Command) {
        listCallCount++;
        if (listCallCount === 1) {
          return {
            Contents: [{ Key: "file1.txt", Size: 100, ETag: '"a"', LastModified: new Date() }],
            IsTruncated: true,
            NextContinuationToken: "token-abc",
          };
        }
        return {
          Contents: [{ Key: "file2.txt", Size: 200, ETag: '"b"', LastModified: new Date() }],
          IsTruncated: false,
        };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureS3(client);

    expect(listCallCount).toBe(2);
    expect(result[0].objects).toHaveLength(2);
  });

  it("no buckets — returns empty array", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListBucketsCommand) {
        return { Buckets: [] };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureS3(client);

    expect(result).toHaveLength(0);
  });
});
