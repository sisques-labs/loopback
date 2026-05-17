import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/config", () => ({
  createAwsConfig: vi.fn(),
}));

import { createAwsConfig } from "@/lib/aws/config";
import { getSNSClient } from "./client";

const fakeConfig = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createAwsConfig).mockResolvedValue(fakeConfig);
});

describe("getSNSClient", () => {
  it("returns an SNSClient instance", async () => {
    const client = await getSNSClient();
    expect(client).toBeDefined();
    expect(typeof client.send).toBe("function");
  });

  it("calls createAwsConfig on each invocation (no singleton caching)", async () => {
    await getSNSClient();
    await getSNSClient();
    expect(vi.mocked(createAwsConfig)).toHaveBeenCalledTimes(2);
  });

  it("returns a NEW instance on each call (no shared reference)", async () => {
    const first = await getSNSClient();
    const second = await getSNSClient();
    expect(first).not.toBe(second);
  });
});
