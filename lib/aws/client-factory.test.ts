import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn().mockImplementation((config) => ({ _config: config })),
}));

vi.mock("@/lib/aws/config", () => ({
  createAwsConfig: vi.fn(),
}));

import { getS3Client } from "./client-factory";
import { S3Client } from "@aws-sdk/client-s3";
import { createAwsConfig } from "@/lib/aws/config";

const mockConfig = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
};

beforeEach(() => {
  vi.clearAllMocks();
  (createAwsConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockConfig);
});

describe("getS3Client", () => {
  it("returns an S3Client instance", async () => {
    const client = await getS3Client();
    expect(client).toBeDefined();
    expect(S3Client).toHaveBeenCalledTimes(1);
  });

  it("calls createAwsConfig on each invocation (no singleton)", async () => {
    await getS3Client();
    await getS3Client();
    expect(createAwsConfig).toHaveBeenCalledTimes(2);
  });

  it("returns a new instance on each call (no caching)", async () => {
    const client1 = await getS3Client();
    const client2 = await getS3Client();
    expect(S3Client).toHaveBeenCalledTimes(2);
    expect(client1).not.toBe(client2);
  });

  it("passes forcePathStyle: true to S3Client constructor", async () => {
    await getS3Client();
    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({ forcePathStyle: true }),
    );
  });

  it("passes config values from createAwsConfig to S3Client constructor", async () => {
    await getS3Client();
    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: mockConfig.endpoint,
        region: mockConfig.region,
        credentials: mockConfig.credentials,
      }),
    );
  });
});
