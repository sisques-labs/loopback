import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  ListTablesCommand,
  DescribeTableCommand,
  ScanCommand,
  type DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { captureDynamoDB } from "./capture-dynamodb";

function makeClient(
  sendFn: (cmd: unknown) => Promise<unknown>,
): DynamoDBClient {
  return { send: sendFn } as unknown as DynamoDBClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("captureDynamoDB", () => {
  it("happy path — 1 table with 3 items", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["Users"] };
      }
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "Users",
            BillingModeSummary: { BillingMode: "PAY_PER_REQUEST" },
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
          },
        };
      }
      if (cmd instanceof ScanCommand) {
        return {
          Items: [
            { pk: { S: "user#1" }, name: { S: "Alice" } },
            { pk: { S: "user#2" }, name: { S: "Bob" } },
            { pk: { S: "user#3" }, name: { S: "Charlie" } },
          ],
        };
      }
      throw new Error(`Unexpected command: ${(cmd as { constructor: { name: string } }).constructor.name}`);
    });

    const result = await captureDynamoDB(client);

    expect(result.tables).toHaveLength(1);
    expect(result.warnings).toHaveLength(0);
    const table = result.tables[0];
    expect(table.tableName).toBe("Users");
    expect(table.billingMode).toBe("PAY_PER_REQUEST");
    expect(table.keySchema).toHaveLength(1);
    expect(table.keySchema[0]).toEqual({ name: "pk", keyType: "HASH" });
    expect(table.items).toHaveLength(3);
    expect(table.items[0]).toEqual({ pk: "user#1", name: "Alice" });
    expect(table.itemCount).toBe(3);
  });

  it("paginated scan — fetches all pages until LastEvaluatedKey is absent", async () => {
    let scanCallCount = 0;
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["Orders"] };
      }
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "Orders",
            BillingModeSummary: { BillingMode: "PAY_PER_REQUEST" },
            AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
            KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          },
        };
      }
      if (cmd instanceof ScanCommand) {
        scanCallCount++;
        if (scanCallCount === 1) {
          return {
            Items: [{ id: { S: "order#1" } }],
            LastEvaluatedKey: { id: { S: "order#1" } },
          };
        }
        return { Items: [{ id: { S: "order#2" } }] };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureDynamoDB(client);

    expect(scanCallCount).toBe(2);
    expect(result.tables[0].items).toHaveLength(2);
    expect(result.tables[0].itemCount).toBe(2);
  });

  it("10K warn flag — includes table and adds a warning", async () => {
    const items = Array.from({ length: 10_001 }, (_, i) => ({
      pk: { S: `user#${i}` },
    }));

    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["BigTable"] };
      }
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "BigTable",
            BillingModeSummary: { BillingMode: "PAY_PER_REQUEST" },
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
          },
        };
      }
      if (cmd instanceof ScanCommand) {
        return { Items: items };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureDynamoDB(client);

    expect(result.tables).toHaveLength(1);
    expect(result.tables[0].itemCount).toBe(10_001);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("BigTable");
  });

  it("50K rejection — skips table and returns empty tables array", async () => {
    const items = Array.from({ length: 50_001 }, (_, i) => ({
      pk: { S: `user#${i}` },
    }));

    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["HugeTable"] };
      }
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "HugeTable",
            BillingModeSummary: { BillingMode: "PAY_PER_REQUEST" },
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
          },
        };
      }
      if (cmd instanceof ScanCommand) {
        return { Items: items };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureDynamoDB(client);

    expect(result.tables).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("HugeTable");
    expect(result.warnings[0]).toContain("50");
  });

  it("returns empty result when no tables exist", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: [] };
      }
      throw new Error("Unexpected command");
    });

    const result = await captureDynamoDB(client);

    expect(result.tables).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
