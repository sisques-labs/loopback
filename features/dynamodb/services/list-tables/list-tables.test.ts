import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock server-only so it doesn't error in tests
vi.mock("server-only", () => ({}));

// Mock the client module
vi.mock("@/features/dynamodb/lib/client", () => ({
  getDynamoDBClient: vi.fn(),
}));

import {
  ListTablesCommand,
  DescribeTableCommand,
  type DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { listTables } from "./list-tables";

function makeClient(sendFn: (cmd: unknown) => Promise<unknown>): DynamoDBClient {
  return { send: sendFn } as unknown as DynamoDBClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listTables", () => {
  it("returns an empty array when there are no tables", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: [] };
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result).toEqual([]);
  });

  it("returns an array of DynamoDBTable with correct fields", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["users"] };
      }
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "users",
            TableStatus: "ACTIVE",
            ItemCount: 42,
            TableSizeBytes: 1024,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "users",
      status: "ACTIVE",
      itemCount: 42,
      tableSizeBytes: 1024,
      partitionKeyName: "pk",
      partitionKeyType: "S",
      sortKeyName: undefined,
      sortKeyType: undefined,
      creationDateTime: undefined,
      billingMode: "PROVISIONED",
      gsiCount: 0,
    });
  });

  it("returns tables with PK and SK when both exist", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) {
        return { TableNames: ["orders"] };
      }
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "orders",
            TableStatus: "ACTIVE",
            ItemCount: 10,
            TableSizeBytes: 512,
            KeySchema: [
              { AttributeName: "pk", KeyType: "HASH" },
              { AttributeName: "sk", KeyType: "RANGE" },
            ],
            AttributeDefinitions: [
              { AttributeName: "pk", AttributeType: "S" },
              { AttributeName: "sk", AttributeType: "N" },
            ],
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result[0].partitionKeyName).toBe("pk");
    expect(result[0].partitionKeyType).toBe("S");
    expect(result[0].sortKeyName).toBe("sk");
    expect(result[0].sortKeyType).toBe("N");
  });

  it("paginates through multiple ListTables pages until no LastEvaluatedTableName", async () => {
    let callCount = 0;
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) {
        callCount++;
        if (callCount === 1) {
          return { TableNames: ["table1"], LastEvaluatedTableName: "table1" };
        }
        return { TableNames: ["table2"] };
      }
      if (cmd instanceof DescribeTableCommand) {
        const input = (cmd as DescribeTableCommand).input;
        return {
          Table: {
            TableName: input.TableName,
            TableStatus: "ACTIVE",
            ItemCount: 0,
            TableSizeBytes: 0,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.name)).toEqual(["table1", "table2"]);
    expect(callCount).toBe(2);
  });

  it("throws a friendly error on AWS failure", async () => {
    const client = makeClient(async () => {
      const err = new Error("Table does not exist");
      err.name = "ResourceNotFoundException";
      throw err;
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    await expect(listTables()).rejects.toThrow();
  });

  // REQ-TD-01: new fields mapped from DescribeTableCommand response
  it("maps creationDateTime as ISO string when CreationDateTime is present", async () => {
    const creationDate = new Date("2024-01-15T10:30:00.000Z");
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: ["users"] };
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "users",
            TableStatus: "ACTIVE",
            ItemCount: 0,
            TableSizeBytes: 0,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
            CreationDateTime: creationDate,
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result[0].creationDateTime).toBe(creationDate.toISOString());
  });

  it("maps creationDateTime as undefined when CreationDateTime is absent", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: ["users"] };
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "users",
            TableStatus: "ACTIVE",
            ItemCount: 0,
            TableSizeBytes: 0,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result[0].creationDateTime).toBeUndefined();
  });

  it("maps billingMode from BillingModeSummary when present", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: ["users"] };
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "users",
            TableStatus: "ACTIVE",
            ItemCount: 0,
            TableSizeBytes: 0,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
            BillingModeSummary: { BillingMode: "PAY_PER_REQUEST" },
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result[0].billingMode).toBe("PAY_PER_REQUEST");
  });

  it("defaults billingMode to 'PROVISIONED' when BillingModeSummary is absent", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: ["users"] };
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "users",
            TableStatus: "ACTIVE",
            ItemCount: 0,
            TableSizeBytes: 0,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result[0].billingMode).toBe("PROVISIONED");
  });

  it("maps gsiCount from GlobalSecondaryIndexes length when present", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: ["users"] };
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "users",
            TableStatus: "ACTIVE",
            ItemCount: 0,
            TableSizeBytes: 0,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
            GlobalSecondaryIndexes: [{ IndexName: "gsi1" }, { IndexName: "gsi2" }],
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result[0].gsiCount).toBe(2);
  });

  it("defaults gsiCount to 0 when GlobalSecondaryIndexes is absent", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: ["users"] };
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "users",
            TableStatus: "ACTIVE",
            ItemCount: 0,
            TableSizeBytes: 0,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result[0].gsiCount).toBe(0);
  });

  it("defaults gsiCount to 0 when GlobalSecondaryIndexes is an empty array", async () => {
    const client = makeClient(async (cmd) => {
      if (cmd instanceof ListTablesCommand) return { TableNames: ["users"] };
      if (cmd instanceof DescribeTableCommand) {
        return {
          Table: {
            TableName: "users",
            TableStatus: "ACTIVE",
            ItemCount: 0,
            TableSizeBytes: 0,
            KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
            GlobalSecondaryIndexes: [],
          },
        };
      }
      throw new Error("unexpected command");
    });
    vi.mocked(getDynamoDBClient).mockReturnValue(client);

    const result = await listTables();
    expect(result[0].gsiCount).toBe(0);
  });
});
