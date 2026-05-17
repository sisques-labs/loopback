import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBDocumentClient: vi.fn(),
}));

import { BatchWriteCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { seedItemsAction } from "./seed-items";
import type { ActionState } from "@/features/shared/types/action-state";

// ─── helpers ────────────────────────────────────────────────────────────────

function makeDocClient(
  sendFn: (cmd: unknown) => Promise<unknown>,
): DynamoDBDocumentClient {
  return { send: sendFn } as unknown as DynamoDBDocumentClient;
}

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

const idle: ActionState<{ written: number; failed: number }> = { status: "idle" };

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── seedItemsAction — validation errors ────────────────────────────────────

describe("seedItemsAction — validation", () => {
  it("returns error for invalid JSON string in itemsJson", async () => {
    const result = await seedItemsAction(
      idle,
      buildFormData({ tableName: "users", itemsJson: "{bad json", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when itemsJson parses to a non-array (object)", async () => {
    const result = await seedItemsAction(
      idle,
      buildFormData({ tableName: "users", itemsJson: '{"pk":"1"}', locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when itemsJson parses to a non-array (string)", async () => {
    const result = await seedItemsAction(
      idle,
      buildFormData({ tableName: "users", itemsJson: '"hello"', locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when array is empty", async () => {
    const result = await seedItemsAction(
      idle,
      buildFormData({ tableName: "users", itemsJson: "[]", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });
});

// ─── seedItemsAction — happy path ───────────────────────────────────────────

describe("seedItemsAction — happy path", () => {
  it("calls BatchWriteCommand once for ≤25 items and returns success", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const items = [{ pk: "1" }, { pk: "2" }];
    const result = await seedItemsAction(
      idle,
      buildFormData({
        tableName: "users",
        itemsJson: JSON.stringify(items),
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
    expect(sendFn).toHaveBeenCalledTimes(1);
    expect(sendFn.mock.calls[0][0]).toBeInstanceOf(BatchWriteCommand);

    const cmd = sendFn.mock.calls[0][0] as BatchWriteCommand;
    expect(cmd.input.RequestItems?.["users"]).toHaveLength(2);
  });

  it("returns written:2 and failed:0 in data on full success", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const items = [{ pk: "1" }, { pk: "2" }];
    const result = await seedItemsAction(
      idle,
      buildFormData({
        tableName: "users",
        itemsJson: JSON.stringify(items),
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.written).toBe(2);
      expect(result.data.failed).toBe(0);
    }
  });

  it("calls BatchWriteCommand 3 times for 60 items (chunks of 25/25/10)", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const items = Array.from({ length: 60 }, (_, i) => ({ pk: String(i) }));
    const result = await seedItemsAction(
      idle,
      buildFormData({
        tableName: "orders",
        itemsJson: JSON.stringify(items),
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
    expect(sendFn).toHaveBeenCalledTimes(3);
    if (result.status === "success") {
      expect(result.data.written).toBe(60);
      expect(result.data.failed).toBe(0);
    }
  });

  it("calls revalidatePath when all items succeed", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const items = [{ pk: "1" }];
    await seedItemsAction(
      idle,
      buildFormData({
        tableName: "users",
        itemsJson: JSON.stringify(items),
        locale: "en",
      }),
    );

    expect(revalidatePath).toHaveBeenCalledWith("/dynamodb/users", "layout");
  });
});

// ─── seedItemsAction — UnprocessedItems retry ───────────────────────────────

describe("seedItemsAction — UnprocessedItems", () => {
  it("retries UnprocessedItems once and counts still-failed items as failures", async () => {
    // First call: returns 3 unprocessed items. Retry call: still returns those 3 as unprocessed.
    const unprocessed = [{ pk: "x" }, { pk: "y" }, { pk: "z" }];
    const unprocessedRequests = unprocessed.map((item) => ({
      PutRequest: { Item: item },
    }));

    let callCount = 0;
    const sendFn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First batch call: 3 items unprocessed
        return Promise.resolve({
          UnprocessedItems: { users: unprocessedRequests },
        });
      }
      // Retry call: still 3 unprocessed (retry fails)
      return Promise.resolve({
        UnprocessedItems: { users: unprocessedRequests },
      });
    });
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const items = Array.from({ length: 3 }, (_, i) => ({ pk: `item-${i}` }));
    const result = await seedItemsAction(
      idle,
      buildFormData({
        tableName: "users",
        itemsJson: JSON.stringify(items),
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    // sendFn called twice: once for the chunk, once for the retry
    expect(sendFn).toHaveBeenCalledTimes(2);
  });

  it("does NOT call revalidatePath when there are failures", async () => {
    const unprocessedRequests = [{ PutRequest: { Item: { pk: "1" } } }];
    const sendFn = vi.fn().mockResolvedValue({
      UnprocessedItems: { users: unprocessedRequests },
    });
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const items = [{ pk: "1" }];
    await seedItemsAction(
      idle,
      buildFormData({
        tableName: "users",
        itemsJson: JSON.stringify(items),
        locale: "en",
      }),
    );

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

// ─── seedItemsAction — SDK exception ────────────────────────────────────────

describe("seedItemsAction — SDK exception", () => {
  it("returns toFriendlyError message on SDK exception", async () => {
    const sdkError = new Error("connection failed");
    sdkError.name = "ResourceNotFoundException";

    const sendFn = vi.fn().mockRejectedValue(sdkError);
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const items = [{ pk: "1" }];
    const result = await seedItemsAction(
      idle,
      buildFormData({
        tableName: "users",
        itemsJson: JSON.stringify(items),
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      // toFriendlyError maps ResourceNotFoundException to the dict string
      expect(result.message).toBeTruthy();
      expect(result.message.length).toBeGreaterThan(0);
    }
  });
});
