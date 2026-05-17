import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBClient: vi.fn(),
}));

import { ScanCommand, type DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { scanTable } from "./scan-table";

function makeClient(sendFn: (cmd: unknown) => Promise<unknown>): DynamoDBClient {
  return { send: sendFn } as unknown as DynamoDBClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("scanTable", () => {
  it("returns items array and null nextKey when no LastEvaluatedKey", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ScanCommand) {
        return {
          Items: [{ pk: { S: "user#1" }, name: { S: "Alice" } }],
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await scanTable("users");
    expect(result.items).toHaveLength(1);
    expect(result.nextKey).toBeNull();
    // items should be unmarshalled (native JS values)
    expect(result.items[0]).toEqual({ pk: "user#1", name: "Alice" });
  });

  it("returns a base64 nextKey when LastEvaluatedKey is present", async () => {
    const lastKey = { pk: { S: "user#50" } };
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ScanCommand) {
        return {
          Items: [],
          LastEvaluatedKey: lastKey,
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await scanTable("users");
    expect(result.nextKey).not.toBeNull();
    // Should be a base64 string
    const decoded = JSON.parse(Buffer.from(result.nextKey!, "base64").toString("utf8"));
    expect(decoded).toEqual(lastKey);
  });

  it("returns empty items array and null nextKey for empty table", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ScanCommand) {
        return { Items: [] };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await scanTable("empty-table");
    expect(result.items).toEqual([]);
    expect(result.nextKey).toBeNull();
  });

  it("passes startKey as ExclusiveStartKey to ScanCommand", async () => {
    const startKey = { pk: { S: "user#10" } };
    let capturedInput: Record<string, unknown> | null = null;

    const client = makeClient(async (cmd) => {
      if (cmd instanceof ScanCommand) {
        capturedInput = (cmd as ScanCommand).input as unknown as Record<string, unknown>;
        return { Items: [] };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    await scanTable("users", startKey);
    expect(capturedInput).not.toBeNull();
    expect(capturedInput!.ExclusiveStartKey).toEqual(startKey);
  });

  it("uses Limit: 50 in the ScanCommand", async () => {
    let capturedInput: Record<string, unknown> | null = null;

    const client = makeClient(async (cmd) => {
      if (cmd instanceof ScanCommand) {
        capturedInput = (cmd as ScanCommand).input as unknown as Record<string, unknown>;
        return { Items: [] };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    await scanTable("users");
    expect(capturedInput!.Limit).toBe(50);
  });

  it("throws a friendly error on ResourceNotFoundException", async () => {
    const client = makeClient(async () => {
      const err = new Error("Table not found");
      err.name = "ResourceNotFoundException";
      throw err;
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    await expect(scanTable("nonexistent")).rejects.toThrow();
  });
});
