import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/config", () => ({
  createAwsConfig: vi.fn(),
}));

import { createAwsConfig } from "@/lib/aws/config";
import { getLambdaClient } from "./client";

function hasInspectorMiddleware(client: { middlewareStack: { identify: () => string[] } }) {
  return client.middlewareStack.identify().some((entry) =>
    entry.startsWith("InspectorMiddleware"),
  );
}

const fakeConfig = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createAwsConfig).mockResolvedValue(fakeConfig);
});

describe("getLambdaClient", () => {
  it("returns a LambdaClient instance", async () => {
    const client = await getLambdaClient();
    expect(client).toBeDefined();
    expect(typeof client.send).toBe("function");
  });

  it("calls createAwsConfig on each invocation (no singleton caching)", async () => {
    await getLambdaClient();
    await getLambdaClient();
    expect(vi.mocked(createAwsConfig)).toHaveBeenCalledTimes(2);
  });

  it("returns a NEW instance on each call (no shared reference)", async () => {
    const first = await getLambdaClient();
    const second = await getLambdaClient();
    expect(first).not.toBe(second);
  });

  it("has InspectorMiddleware registered (INSPECTOR tag, deserialize step)", async () => {
    const client = await getLambdaClient();
    expect(hasInspectorMiddleware(client)).toBe(true);
  });
});
