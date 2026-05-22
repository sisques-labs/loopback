import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBDocumentClient: vi.fn(),
}));

import { UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { updateItemAction } from "./update-item";
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

// ---------------------------------------------------------------------------
// JSON validation — mirrors put-item suite
// ---------------------------------------------------------------------------
describe("updateItemAction — JSON validation", () => {
  it("returns error when itemJson is empty", async () => {
    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: "",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when itemJson is invalid JSON", async () => {
    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: "{bad json",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when itemJson is an array", async () => {
    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: "[1, 2, 3]",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when itemJson is null", async () => {
    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: "null",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when itemJson is a string primitive", async () => {
    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: '"hello"',
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when keyJson is invalid JSON", async () => {
    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: "{bad",
        itemJson: '{"pk":"user#1","name":"Alice"}',
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// UpdateCommand — key stripping + dynamic SET aliasing
// ---------------------------------------------------------------------------
describe("updateItemAction — UpdateCommand construction", () => {
  it("sends UpdateCommand with key attrs stripped and dynamic SET for non-key attrs (PK only)", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    const client = makeDocClient(sendFn);
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(client);

    await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: '{"pk":"user#1","name":"Alice","age":30}',
        locale: "en",
      }),
    );

    expect(sendFn).toHaveBeenCalledOnce();
    const cmd = sendFn.mock.calls[0][0] as UpdateCommand;
    expect(cmd.input.TableName).toBe("users");

    // Key should be in Key, not in expression
    expect(cmd.input.Key).toEqual({ pk: "user#1" });

    // Expression must cover name and age — order may vary
    const expr = cmd.input.UpdateExpression as string;
    expect(expr).toContain("SET");
    expect(expr).not.toContain("pk"); // pk must not appear in expression

    // ExpressionAttributeNames must not contain pk alias
    const names = cmd.input.ExpressionAttributeNames as Record<string, string>;
    expect(Object.values(names)).not.toContain("pk");
    // Non-key attrs must be aliased
    expect(Object.values(names)).toContain("name");
    expect(Object.values(names)).toContain("age");

    // ExpressionAttributeValues must contain name and age values
    const vals = cmd.input.ExpressionAttributeValues as Record<string, unknown>;
    const valList = Object.values(vals);
    expect(valList).toContain("Alice");
    expect(valList).toContain(30);
  });

  it("sends UpdateCommand with both PK and SK stripped (PK + SK table)", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    const client = makeDocClient(sendFn);
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(client);

    await updateItemAction(
      idle,
      buildFormData({
        tableName: "orders",
        keyJson: '{"pk":"order#1","sk":"2024-01-01"}',
        itemJson: '{"pk":"order#1","sk":"2024-01-01","amount":99.99,"status":"pending"}',
        locale: "en",
      }),
    );

    expect(sendFn).toHaveBeenCalledOnce();
    const cmd = sendFn.mock.calls[0][0] as UpdateCommand;

    // Key must contain both PK and SK
    expect(cmd.input.Key).toEqual({ pk: "order#1", sk: "2024-01-01" });

    // pk and sk must not appear in expression
    const names = cmd.input.ExpressionAttributeNames as Record<string, string>;
    expect(Object.values(names)).not.toContain("pk");
    expect(Object.values(names)).not.toContain("sk");
    // Non-key attrs must be aliased
    expect(Object.values(names)).toContain("amount");
    expect(Object.values(names)).toContain("status");
  });

  it("calls revalidatePath after successful update", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: '{"pk":"user#1","name":"Bob"}',
        locale: "en",
      }),
    );

    expect(revalidatePath).toHaveBeenCalledWith("/dynamodb/users", "layout");
  });

  it("returns success after successful update", async () => {
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(
      makeDocClient(async () => ({})),
    );

    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: '{"pk":"user#1","name":"Carol"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
  });
});

// ---------------------------------------------------------------------------
// Empty non-key attrs guard — no-op path
// ---------------------------------------------------------------------------
describe("updateItemAction — empty non-key attrs guard", () => {
  it("returns success without sending when item has only key attrs", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: '{"pk":"user#1"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
    expect(sendFn).not.toHaveBeenCalled();
  });

  it("returns success without sending when PK+SK item has only key attrs", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "orders",
        keyJson: '{"pk":"order#1","sk":"2024-01-01"}',
        itemJson: '{"pk":"order#1","sk":"2024-01-01"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
    expect(sendFn).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// SDK error handling
// ---------------------------------------------------------------------------
describe("updateItemAction — SDK error handling", () => {
  it("returns error when SDK throws", async () => {
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(
      makeDocClient(async () => {
        throw new Error("ProvisionedThroughputExceededException");
      }),
    );

    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: '{"pk":"user#1","name":"Dan"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Size validation (400 KB limit)
// ---------------------------------------------------------------------------
describe("updateItemAction — size validation (400 KB limit)", () => {
  it("returns error when itemJson exceeds 400 KB", async () => {
    const bigItem = '{"pk":"user#1","data":"' + "x".repeat(410 * 1024) + '"}';

    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: bigItem,
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBeTruthy();
    }
  });

  it("returns error when keyJson exceeds 400 KB", async () => {
    const bigKey = '{"pk":"' + "x".repeat(410 * 1024) + '"}';

    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: bigKey,
        itemJson: '{"pk":"user#1","name":"Alice"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Proto-pollution
// ---------------------------------------------------------------------------
describe("updateItemAction — proto-pollution scrubbing", () => {
  it("sanitizes __proto__ in itemJson and still updates", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1"}',
        itemJson: '{"pk":"user#1","__proto__":{"polluted":true},"name":"Alice"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
    expect((Object.prototype as Record<string, unknown>)["polluted"]).toBeUndefined();
  });

  it("sanitizes __proto__ in keyJson and still updates", async () => {
    const sendFn = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBDocumentClient).mockResolvedValue(makeDocClient(sendFn));

    const result = await updateItemAction(
      idle,
      buildFormData({
        tableName: "users",
        keyJson: '{"pk":"user#1","__proto__":{"polluted":true}}',
        itemJson: '{"pk":"user#1","name":"Alice"}',
        locale: "en",
      }),
    );

    expect(result.status).toBe("success");
    expect((Object.prototype as Record<string, unknown>)["polluted"]).toBeUndefined();
  });
});
