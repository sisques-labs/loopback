import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  CreateBucketCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { restoreS3 } from "./restore-s3";
import type { S3BucketSnapshot } from "@/features/snapshots/lib/types/snapshot";

function makeClient(
  sendFn: (cmd: unknown) => Promise<unknown>,
): S3Client {
  return { send: sendFn } as unknown as S3Client;
}

const BUCKET_SNAPSHOT: S3BucketSnapshot = {
  bucketName: "my-assets",
  objects: [
    { key: "photo.jpg", size: 1024, lastModified: "2024-01-01T00:00:00.000Z" },
    { key: "doc.pdf", size: 2048, lastModified: "2024-01-02T00:00:00.000Z" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("restoreS3", () => {
  it("creates bucket (no PutObject calls for objects)", async () => {
    const calls: unknown[] = [];
    const client = makeClient(async (cmd) => {
      calls.push(cmd);
      return {};
    });

    const report = await restoreS3(client, [BUCKET_SNAPSHOT]);

    expect(report.service).toBe("s3");
    expect(report.resources).toHaveLength(1);
    expect(report.resources[0].name).toBe("my-assets");
    expect(report.resources[0].status).toBe("created");

    const createCalls = calls.filter((c) => c instanceof CreateBucketCommand);
    expect(createCalls).toHaveLength(1);

    // Objects must NOT be restored
    const putCalls = calls.filter((c) => c instanceof PutObjectCommand);
    expect(putCalls).toHaveLength(0);
  });

  it("skips bucket when BucketAlreadyOwnedByYou is thrown", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof CreateBucketCommand) {
        const err = Object.assign(new Error("Bucket already owned by you"), {
          name: "BucketAlreadyOwnedByYou",
        });
        throw err;
      }
      throw new Error("Unexpected");
    });

    const report = await restoreS3(client, [BUCKET_SNAPSHOT]);

    expect(report.resources[0].status).toBe("skipped");
    expect(report.resources[0].error).toBeUndefined();
  });

  it("returns empty resources when no buckets provided", async () => {
    const client = makeClient(async () => ({}));
    const report = await restoreS3(client, []);
    expect(report.service).toBe("s3");
    expect(report.resources).toHaveLength(0);
  });
});
