import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBClient: vi.fn(),
}));

import {
  ListTablesCommand,
  DeleteTableCommand,
  type DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { resetDynamoDB } from "./reset-dynamodb";

function makeClient(sendFn: (cmd: unknown) => Promise<unknown>): DynamoDBClient {
  return { send: sendFn } as unknown as DynamoDBClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resetDynamoDB — no tables", () => {
  it("returns empty arrays when there are no tables", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: [] };
      return {};
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetDynamoDB();

    expect(result.deleted).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });
});

describe("resetDynamoDB — happy path", () => {
  it("lists and deletes all tables", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["loopback-ecommerce-catalog", "loopback-blog-posts"] };
      }
      if (cmd instanceof DeleteTableCommand) return {};
      return {};
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetDynamoDB();

    const deleteCount = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteTableCommand,
    ).length;
    expect(deleteCount).toBe(2);

    expect(result.deleted).toContain("loopback-ecommerce-catalog");
    expect(result.deleted).toContain("loopback-blog-posts");
    expect(result.failed).toHaveLength(0);
  });
});

describe("resetDynamoDB — partial failure", () => {
  it("records failed table on error, continues others", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["ok-table", "fail-table"] };
      }
      if (cmd instanceof DeleteTableCommand) {
        const name = (cmd as DeleteTableCommand).input.TableName ?? "";
        if (name === "fail-table") throw new Error("Table not found");
        return {};
      }
      return {};
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(makeClient(mockSend));

    const result = await resetDynamoDB();

    expect(result.deleted).toContain("ok-table");
    expect(result.failed).toContain("fail-table");
  });
});

describe("resetDynamoDB — dry-run", () => {
  it("returns table count without deleting", async () => {
    const mockSend = vi.fn().mockImplementation((cmd: unknown) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["t1", "t2"] };
      }
      return {};
    });
    vi.mocked(getDynamoDBClient).mockResolvedValue(makeClient(mockSend));

    const count = await resetDynamoDB({ dryRun: true });

    expect(count).toBe(2);
    const deleteCalls = mockSend.mock.calls.filter(
      ([cmd]) => cmd instanceof DeleteTableCommand,
    );
    expect(deleteCalls).toHaveLength(0);
  });
});
