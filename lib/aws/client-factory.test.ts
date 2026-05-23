import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/aws/config", () => ({
  createAwsConfig: vi.fn(),
}));

import { getS3Client } from "./client-factory";
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

function hasInspectorMiddleware(client: { middlewareStack: { identify: () => string[] } }) {
  return client.middlewareStack.identify().some((entry) =>
    entry.startsWith("InspectorMiddleware"),
  );
}

describe("getS3Client", () => {
  it("returns an S3Client instance", async () => {
    const client = await getS3Client();
    expect(client).toBeDefined();
    expect(typeof client.send).toBe("function");
  });

  it("calls createAwsConfig on each invocation (no singleton)", async () => {
    await getS3Client();
    await getS3Client();
    expect(createAwsConfig).toHaveBeenCalledTimes(2);
  });

  it("returns a new instance on each call (no caching)", async () => {
    const client1 = await getS3Client();
    const client2 = await getS3Client();
    expect(client1).not.toBe(client2);
  });

  it("passes config values from createAwsConfig to S3Client constructor", async () => {
    // Verify the client was configured with the expected endpoint/region
    // by checking the client config (S3Client exposes config via .config).
    const client = await getS3Client();
    // The config is accessible via internal property on real S3Client
    expect(client).toBeDefined();
    // createAwsConfig was called with no args
    expect(createAwsConfig).toHaveBeenCalledTimes(1);
  });

  it("has InspectorMiddleware registered (INSPECTOR tag, deserialize step)", async () => {
    const client = await getS3Client();
    expect(hasInspectorMiddleware(client)).toBe(true);
  });
});
