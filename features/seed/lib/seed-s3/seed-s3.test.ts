import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/client-factory", () => ({
  getS3Client: vi.fn(),
}));

import { CreateBucketCommand, type S3Client } from "@aws-sdk/client-s3";
import { getS3Client } from "@/lib/aws/client-factory";
import { seedS3 } from "./seed-s3";
import type { S3Resource } from "@/features/seed/presets/schema";

function makeS3Client(sendFn: (cmd: unknown) => Promise<unknown>): S3Client {
  return { send: sendFn } as unknown as S3Client;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("seedS3 — happy path", () => {
  it("calls CreateBucketCommand for each bucket and returns created names", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const buckets: S3Resource[] = [
      { name: "loopback-ecommerce-products" },
      { name: "loopback-ecommerce-media" },
    ];

    const result = await seedS3(buckets);

    expect(mockSend).toHaveBeenCalledTimes(2);
    const cmd0 = mockSend.mock.calls[0][0];
    expect(cmd0).toBeInstanceOf(CreateBucketCommand);
    expect(cmd0.input.Bucket).toBe("loopback-ecommerce-products");
    expect(result.created).toContain("loopback-ecommerce-products");
    expect(result.created).toContain("loopback-ecommerce-media");
    expect(result.skipped).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});

describe("seedS3 — idempotency", () => {
  it("records skipped when BucketAlreadyExists is thrown", async () => {
    const alreadyExists = Object.assign(new Error("bucket exists"), {
      name: "BucketAlreadyExists",
    });
    const mockSend = vi.fn().mockRejectedValueOnce(alreadyExists);
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const result = await seedS3([{ name: "loopback-ecommerce-products" }]);

    expect(result.skipped).toContain("loopback-ecommerce-products");
    expect(result.created).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it("records skipped when BucketAlreadyOwnedByYou is thrown", async () => {
    const alreadyOwned = Object.assign(new Error("owned"), {
      name: "BucketAlreadyOwnedByYou",
    });
    const mockSend = vi.fn().mockRejectedValueOnce(alreadyOwned);
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const result = await seedS3([{ name: "loopback-ecommerce-products" }]);

    expect(result.skipped).toContain("loopback-ecommerce-products");
    expect(result.failed).toHaveLength(0);
  });
});

describe("seedS3 — partial failure", () => {
  it("records failed on unexpected errors, continues other buckets", async () => {
    const mockSend = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({});
    vi.mocked(getS3Client).mockResolvedValue(makeS3Client(mockSend));

    const buckets: S3Resource[] = [
      { name: "loopback-ecommerce-products" },
      { name: "loopback-ecommerce-media" },
    ];
    const result = await seedS3(buckets);

    expect(result.failed).toContain("loopback-ecommerce-products");
    expect(result.created).toContain("loopback-ecommerce-media");
  });
});

describe("seedS3 — empty input", () => {
  it("returns empty arrays for empty bucket list", async () => {
    vi.mocked(getS3Client).mockResolvedValue(
      makeS3Client(vi.fn().mockResolvedValue({})),
    );

    const result = await seedS3([]);

    expect(result.created).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});
