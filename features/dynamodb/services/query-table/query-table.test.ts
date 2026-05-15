import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBClient: vi.fn(),
}));

import { QueryCommand, type DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { queryTable } from "./query-table";

function makeClient(sendFn: (cmd: unknown) => Promise<unknown>): DynamoDBClient {
  return { send: sendFn } as unknown as DynamoDBClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("queryTable", () => {
  it("returns unmarshalled items and null nextKey when no LastEvaluatedKey", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof QueryCommand) {
        return {
          Items: [{ pk: { S: "user#1" }, name: { S: "Alice" } }],
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await queryTable("users", { name: "pk", value: "user#1" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({ pk: "user#1", name: "Alice" });
    expect(result.nextKey).toBeNull();
  });

  it("returns base64 nextKey when LastEvaluatedKey is present", async () => {
    const lastKey = { pk: { S: "user#50" } };
    const client = makeClient(async (cmd) => {
      if (cmd instanceof QueryCommand) {
        return { Items: [], LastEvaluatedKey: lastKey };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await queryTable("users", { name: "pk", value: "user#1" });
    expect(result.nextKey).not.toBeNull();
    const decoded = JSON.parse(Buffer.from(result.nextKey!, "base64").toString("utf8"));
    expect(decoded).toEqual(lastKey);
  });

  it("uses KeyConditionExpression #pk = :pk without SK", async () => {
    let capturedInput: Record<string, unknown> | null = null;

    const client = makeClient(async (cmd) => {
      if (cmd instanceof QueryCommand) {
        capturedInput = (cmd as QueryCommand).input as unknown as Record<string, unknown>;
        return { Items: [] };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    await queryTable("users", { name: "pk", value: "user#1" });
    expect(capturedInput!.KeyConditionExpression).toBe("#pk = :pk");
    expect(capturedInput!.ExpressionAttributeNames).toEqual({ "#pk": "pk" });
    expect(capturedInput!.ExpressionAttributeValues).toEqual({ ":pk": { S: "user#1" } });
  });

  it("appends AND #sk = :sk when sort key is provided", async () => {
    let capturedInput: Record<string, unknown> | null = null;

    const client = makeClient(async (cmd) => {
      if (cmd instanceof QueryCommand) {
        capturedInput = (cmd as QueryCommand).input as unknown as Record<string, unknown>;
        return { Items: [] };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    await queryTable(
      "users",
      { name: "pk", value: "user#1" },
      { name: "sk", value: "order#5" },
    );
    expect(capturedInput!.KeyConditionExpression).toBe("#pk = :pk AND #sk = :sk");
    expect(capturedInput!.ExpressionAttributeNames).toEqual({ "#pk": "pk", "#sk": "sk" });
    expect(capturedInput!.ExpressionAttributeValues).toEqual({
      ":pk": { S: "user#1" },
      ":sk": { S: "order#5" },
    });
  });

  it("uses Limit: 50 in the QueryCommand", async () => {
    let capturedInput: Record<string, unknown> | null = null;

    const client = makeClient(async (cmd) => {
      if (cmd instanceof QueryCommand) {
        capturedInput = (cmd as QueryCommand).input as unknown as Record<string, unknown>;
        return { Items: [] };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    await queryTable("users", { name: "pk", value: "user#1" });
    expect(capturedInput!.Limit).toBe(50);
  });

  it("passes startKey as ExclusiveStartKey", async () => {
    const startKey = { pk: { S: "user#10" } };
    let capturedInput: Record<string, unknown> | null = null;

    const client = makeClient(async (cmd) => {
      if (cmd instanceof QueryCommand) {
        capturedInput = (cmd as QueryCommand).input as unknown as Record<string, unknown>;
        return { Items: [] };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    await queryTable("users", { name: "pk", value: "user#1" }, undefined, startKey);
    expect(capturedInput!.ExclusiveStartKey).toEqual(startKey);
  });

  it("throws a friendly error on ResourceNotFoundException", async () => {
    const client = makeClient(async () => {
      const err = new Error("Table not found");
      err.name = "ResourceNotFoundException";
      throw err;
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    await expect(queryTable("nonexistent", { name: "pk", value: "x" })).rejects.toThrow();
  });
});
