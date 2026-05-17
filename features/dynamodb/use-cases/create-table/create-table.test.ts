import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Mock the services used
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBClient: vi.fn(),
}));

import { type DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { createTableAction } from "./create-table";
import type { ActionState } from "@/features/shared/types/action-state";

function makeClient(sendFn: (cmd: unknown) => Promise<unknown>): DynamoDBClient {
  return { send: sendFn } as unknown as DynamoDBClient;
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

describe("createTableAction — tableName validation", () => {
  it("returns error when tableName is empty", async () => {
    const result = await createTableAction(
      idle,
      buildFormData({ tableName: "", partitionKeyName: "pk", partitionKeyType: "S", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when tableName has only 2 characters", async () => {
    const result = await createTableAction(
      idle,
      buildFormData({ tableName: "ab", partitionKeyName: "pk", partitionKeyType: "S", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("accepts tableName with exactly 3 characters", async () => {
    const client = makeClient(async () => ({}));
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await createTableAction(
      idle,
      buildFormData({ tableName: "abc", partitionKeyName: "pk", partitionKeyType: "S", locale: "en" }),
    );
    expect(result.status).not.toBe("error");
  });

  it("returns error when tableName has 256 characters (too long)", async () => {
    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "a".repeat(256),
        partitionKeyName: "pk",
        partitionKeyType: "S",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("accepts tableName with exactly 255 characters", async () => {
    const client = makeClient(async () => ({}));
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "a".repeat(255),
        partitionKeyName: "pk",
        partitionKeyType: "S",
        locale: "en",
      }),
    );
    expect(result.status).not.toBe("error");
  });

  it("returns error for tableName with invalid characters (space)", async () => {
    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "my table",
        partitionKeyName: "pk",
        partitionKeyType: "S",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error for tableName with invalid characters (@)", async () => {
    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "my@table",
        partitionKeyName: "pk",
        partitionKeyType: "S",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("accepts tableName with valid special chars (.- _)", async () => {
    const client = makeClient(async () => ({}));
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "my-table_v2.0",
        partitionKeyName: "pk",
        partitionKeyType: "S",
        locale: "en",
      }),
    );
    expect(result.status).not.toBe("error");
  });
});

describe("createTableAction — PK validation", () => {
  it("returns error when partitionKeyName is empty", async () => {
    const result = await createTableAction(
      idle,
      buildFormData({ tableName: "mytable", partitionKeyName: "", partitionKeyType: "S", locale: "en" }),
    );
    expect(result.status).toBe("error");
  });

  it("returns error when partitionKeyType is invalid", async () => {
    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "mytable",
        partitionKeyName: "pk",
        partitionKeyType: "X",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("accepts valid partitionKeyTypes: S, N, B", async () => {
    for (const type of ["S", "N", "B"]) {
      const client = makeClient(async () => ({}));
      vi.mocked(getDynamoDBClient).mockResolvedValue(client);

      const result = await createTableAction(
        idle,
        buildFormData({
          tableName: "mytable",
          partitionKeyName: "pk",
          partitionKeyType: type,
          locale: "en",
        }),
      );
      expect(result.status).not.toBe("error");
    }
  });
});

describe("createTableAction — SK conditional validation", () => {
  it("returns error when sortKeyName is provided but sortKeyType is missing", async () => {
    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "mytable",
        partitionKeyName: "pk",
        partitionKeyType: "S",
        sortKeyName: "sk",
        sortKeyType: "",
        locale: "en",
      }),
    );
    expect(result.status).toBe("error");
  });

  it("accepts when sortKeyName is provided with a valid sortKeyType", async () => {
    const client = makeClient(async () => ({}));
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "mytable",
        partitionKeyName: "pk",
        partitionKeyType: "S",
        sortKeyName: "sk",
        sortKeyType: "N",
        locale: "en",
      }),
    );
    expect(result.status).not.toBe("error");
  });

  it("accepts when sortKeyName is empty and sortKeyType is also empty", async () => {
    const client = makeClient(async () => ({}));
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "mytable",
        partitionKeyName: "pk",
        partitionKeyType: "S",
        sortKeyName: "",
        sortKeyType: "",
        locale: "en",
      }),
    );
    expect(result.status).not.toBe("error");
  });
});

describe("createTableAction — success", () => {
  it("returns success when all inputs are valid", async () => {
    const client = makeClient(async () => ({}));
    vi.mocked(getDynamoDBClient).mockResolvedValue(client);

    const result = await createTableAction(
      idle,
      buildFormData({
        tableName: "mytable",
        partitionKeyName: "pk",
        partitionKeyType: "S",
        locale: "en",
      }),
    );
    expect(result.status).toBe("success");
  });
});
