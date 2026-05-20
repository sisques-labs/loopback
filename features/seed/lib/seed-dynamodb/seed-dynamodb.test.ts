import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBClient: vi.fn(),
}));

import { CreateTableCommand, type DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { seedDynamoDB } from "./seed-dynamodb";
import type { DynamoDBResource } from "@/features/seed/presets/schema";

function makeDynamoClient(sendFn: (cmd: unknown) => Promise<unknown>): DynamoDBClient {
  return { send: sendFn } as unknown as DynamoDBClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("seedDynamoDB — happy path", () => {
  it("calls CreateTableCommand for each table and returns created names", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBClient).mockResolvedValue(makeDynamoClient(mockSend));

    const tables: DynamoDBResource[] = [
      { name: "loopback-ecommerce-catalog", pk: "id" },
      { name: "loopback-ecommerce-users", pk: "userId" },
    ];

    const result = await seedDynamoDB(tables);

    expect(mockSend).toHaveBeenCalledTimes(2);
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd).toBeInstanceOf(CreateTableCommand);
    expect(cmd.input.TableName).toBe("loopback-ecommerce-catalog");
    expect(result.created).toContain("loopback-ecommerce-catalog");
    expect(result.created).toContain("loopback-ecommerce-users");
    expect(result.skipped).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it("sets the partition key in KeySchema and AttributeDefinitions", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    vi.mocked(getDynamoDBClient).mockResolvedValue(makeDynamoClient(mockSend));

    await seedDynamoDB([{ name: "loopback-ecommerce-catalog", pk: "id" }]);

    const cmd = mockSend.mock.calls[0][0];
    expect(cmd.input.KeySchema).toEqual([{ AttributeName: "id", KeyType: "HASH" }]);
    expect(cmd.input.AttributeDefinitions).toContainEqual({
      AttributeName: "id",
      AttributeType: "S",
    });
  });
});

describe("seedDynamoDB — idempotency", () => {
  it("records skipped when ResourceInUseException is thrown", async () => {
    const exists = Object.assign(new Error("table exists"), {
      name: "ResourceInUseException",
    });
    const mockSend = vi.fn().mockRejectedValueOnce(exists);
    vi.mocked(getDynamoDBClient).mockResolvedValue(makeDynamoClient(mockSend));

    const result = await seedDynamoDB([
      { name: "loopback-ecommerce-catalog", pk: "id" },
    ]);

    expect(result.skipped).toContain("loopback-ecommerce-catalog");
    expect(result.failed).toHaveLength(0);
  });
});

describe("seedDynamoDB — partial failure", () => {
  it("records failed on unexpected errors, continues other tables", async () => {
    const mockSend = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({});
    vi.mocked(getDynamoDBClient).mockResolvedValue(makeDynamoClient(mockSend));

    const result = await seedDynamoDB([
      { name: "loopback-ecommerce-catalog", pk: "id" },
      { name: "loopback-ecommerce-users", pk: "userId" },
    ]);

    expect(result.failed).toContain("loopback-ecommerce-catalog");
    expect(result.created).toContain("loopback-ecommerce-users");
  });
});
