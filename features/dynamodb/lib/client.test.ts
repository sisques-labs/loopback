import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aws/config", () => ({
  createAwsConfig: vi.fn(),
}));

import { createAwsConfig } from "@/lib/aws/config";
import { getDynamoDBClient, getDynamoDBDocumentClient } from "./client";

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

describe("getDynamoDBClient", () => {
  it("returns a DynamoDBClient instance", async () => {
    const client = await getDynamoDBClient();
    expect(client).toBeDefined();
    expect(typeof client.send).toBe("function");
  });

  it("calls createAwsConfig on each invocation (no singleton caching)", async () => {
    await getDynamoDBClient();
    await getDynamoDBClient();
    // Each call must invoke createAwsConfig — proves no singleton cache
    expect(vi.mocked(createAwsConfig)).toHaveBeenCalledTimes(2);
  });

  it("returns a NEW instance on each call (no shared reference)", async () => {
    const first = await getDynamoDBClient();
    const second = await getDynamoDBClient();
    expect(first).not.toBe(second);
  });

  it("has InspectorMiddleware registered (INSPECTOR tag, deserialize step)", async () => {
    const client = await getDynamoDBClient();
    expect(hasInspectorMiddleware(client)).toBe(true);
  });
});

describe("getDynamoDBDocumentClient", () => {
  it("returns a DynamoDBDocumentClient instance", async () => {
    const docClient = await getDynamoDBDocumentClient();
    expect(docClient).toBeDefined();
    expect(typeof docClient.send).toBe("function");
  });

  it("calls createAwsConfig on each invocation (no singleton caching)", async () => {
    await getDynamoDBDocumentClient();
    await getDynamoDBDocumentClient();
    // getDynamoDBDocumentClient calls getDynamoDBClient which calls createAwsConfig
    expect(vi.mocked(createAwsConfig)).toHaveBeenCalledTimes(2);
  });

  it("returns a NEW instance on each call (no shared reference)", async () => {
    const first = await getDynamoDBDocumentClient();
    const second = await getDynamoDBDocumentClient();
    expect(first).not.toBe(second);
  });
});
