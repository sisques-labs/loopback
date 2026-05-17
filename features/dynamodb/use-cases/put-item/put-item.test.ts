import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBDocumentClient: vi.fn(),
}));

import { PutCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { putItemAction } from "./put-item";
import type { ActionState } from "@/features/shared/types/action-state";

function makeDocClient(sendFn: (cmd: unknown) => Promise<unknown>): DynamoDBDocumentClient {
  return { send: sendFn } as unknown as DynamoDBDocumentClient;
}

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

const idle: ActionState = { status: "idle" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("putItemAction — JSON validation", () => {
  it("returns error for invalid JSON string", async () => {
    const result = await putItemAction(
      idle,
      buildFormData({ tableName: "users", itemJson: "{bad json", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when JSON is an array", async () => {
    const result = await putItemAction(
      idle,
      buildFormData({ tableName: "users", itemJson: "[1, 2, 3]", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when JSON is null", async () => {
    const result = await putItemAction(
      idle,
      buildFormData({ tableName: "users", itemJson: "null", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when JSON is a string primitive", async () => {
    const result = await putItemAction(
      idle,
      buildFormData({ tableName: "users", itemJson: '"hello"', locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when JSON is a number primitive", async () => {
    const result = await putItemAction(
      idle,
      buildFormData({ tableName: "users", itemJson: "42", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when JSON is a boolean primitive", async () => {
    const result = await putItemAction(
      idle,
      buildFormData({ tableName: "users", itemJson: "true", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("accepts a valid JSON object", async () => {
    const client = makeDocClient(async (cmd) => {
      if (cmd instanceof PutCommand) return {};
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(client);

    const result = await putItemAction(
      idle,
      buildFormData({
        tableName: "users",
        itemJson: '{"pk": "user#1", "name": "Alice"}',
        locale: "en",
      }),
    );
    expect(result.status).toBe("success");
  });

  it("accepts a valid JSON object with nested properties", async () => {
    const client = makeDocClient(async (cmd) => {
      if (cmd instanceof PutCommand) return {};
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(client);

    const result = await putItemAction(
      idle,
      buildFormData({
        tableName: "orders",
        itemJson: '{"pk": "order#1", "sk": "2024-01-01", "amount": 99.99, "tags": ["a", "b"]}',
        locale: "en",
      }),
    );
    expect(result.status).toBe("success");
  });

  it("returns error when itemJson is empty", async () => {
    const result = await putItemAction(
      idle,
      buildFormData({ tableName: "users", itemJson: "", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });
});
