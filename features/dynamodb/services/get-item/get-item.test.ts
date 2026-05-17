import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBDocumentClient: vi.fn(),
}));

import { GetCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { getItem } from "./get-item";

function makeDocClient(sendFn: (cmd: unknown) => Promise<unknown>): DynamoDBDocumentClient {
  return { send: sendFn } as unknown as DynamoDBDocumentClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getItem", () => {
  it("returns the item when found", async () => {
    const mockItem = { pk: "user#1", name: "Alice", age: 30 };
    const client = makeDocClient(async (cmd) => {
      if (cmd instanceof GetCommand) {
        return { Item: mockItem };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(client);

    const result = await getItem("users", { pk: "user#1" });
    expect(result).toEqual(mockItem);
  });

  it("returns null when item is not found", async () => {
    const client = makeDocClient(async (cmd) => {
      if (cmd instanceof GetCommand) {
        return { Item: undefined };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(client);

    const result = await getItem("users", { pk: "nonexistent" });
    expect(result).toBeNull();
  });

  it("passes the correct TableName and Key to GetCommand", async () => {
    let capturedInput: Record<string, unknown> | null = null;
    const client = makeDocClient(async (cmd) => {
      if (cmd instanceof GetCommand) {
        capturedInput = (cmd as GetCommand).input as Record<string, unknown>;
        return { Item: undefined };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(client);

    await getItem("orders", { pk: "order#1", sk: "2024-01-01" });
    expect(capturedInput!.TableName).toBe("orders");
    expect(capturedInput!.Key).toEqual({ pk: "order#1", sk: "2024-01-01" });
  });

  it("throws a friendly error on AWS failure", async () => {
    const client = makeDocClient(async () => {
      const err = new Error("Table does not exist");
      err.name = "ResourceNotFoundException";
      throw err;
    });
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(client);

    await expect(getItem("nonexistent", { pk: "x" })).rejects.toThrow();
  });
});
