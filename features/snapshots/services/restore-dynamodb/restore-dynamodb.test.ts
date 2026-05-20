import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  CreateTableCommand,
  BatchWriteItemCommand,
  type DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { restoreDynamoDB } from "./restore-dynamodb";
import type { DynamoDBTableSnapshot } from "@/features/snapshots/lib/types/snapshot";

function makeClients(
  sendFn: (cmd: unknown) => Promise<unknown>,
): { client: DynamoDBClient; docClient: DynamoDBDocumentClient } {
  const mock = { send: sendFn } as unknown as DynamoDBClient;
  return { client: mock, docClient: mock as unknown as DynamoDBDocumentClient };
}

const TABLE_SNAPSHOT: DynamoDBTableSnapshot = {
  tableName: "Users",
  billingMode: "PAY_PER_REQUEST",
  attributeDefinitions: [{ name: "pk", type: "S" }],
  keySchema: [{ name: "pk", keyType: "HASH" }],
  items: [{ pk: "user#1" }, { pk: "user#2" }],
  itemCount: 2,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("restoreDynamoDB", () => {
  it("creates table and writes items when table is absent", async () => {
    const calls: unknown[] = [];
    const { client, docClient } = makeClients(async (cmd) => {
      calls.push(cmd);
      return {};
    });

    const report = await restoreDynamoDB(client, docClient, [TABLE_SNAPSHOT]);

    expect(report.service).toBe("dynamodb");
    expect(report.resources).toHaveLength(1);
    expect(report.resources[0].name).toBe("Users");
    expect(report.resources[0].status).toBe("created");
    expect(report.resources[0].error).toBeUndefined();

    const createTableCalls = calls.filter((c) => c instanceof CreateTableCommand);
    expect(createTableCalls).toHaveLength(1);

    const batchCalls = calls.filter((c) => c instanceof BatchWriteItemCommand);
    expect(batchCalls).toHaveLength(1);
  });

  it("skips CreateTable when table already exists (ResourceInUseException)", async () => {
    const calls: unknown[] = [];
    const { client, docClient } = makeClients(async (cmd) => {
      calls.push(cmd);
      if (cmd instanceof CreateTableCommand) {
        const err = Object.assign(new Error("Table already exists"), {
          name: "ResourceInUseException",
        });
        throw err;
      }
      return {};
    });

    const report = await restoreDynamoDB(client, docClient, [TABLE_SNAPSHOT]);

    expect(report.resources[0].status).toBe("skipped");
    expect(report.resources[0].error).toBeUndefined();

    const batchCalls = calls.filter((c) => c instanceof BatchWriteItemCommand);
    expect(batchCalls).toHaveLength(1);
  });

  it("sends 30 items in 2 batches (25 + 5)", async () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ pk: `item#${i}` }));
    const bigTable: DynamoDBTableSnapshot = {
      ...TABLE_SNAPSHOT,
      tableName: "BigTable",
      items,
      itemCount: 30,
    };

    const batchCalls: BatchWriteItemCommand[] = [];
    const { client, docClient } = makeClients(async (cmd) => {
      if (cmd instanceof BatchWriteItemCommand) {
        batchCalls.push(cmd);
      }
      return {};
    });

    await restoreDynamoDB(client, docClient, [bigTable]);

    expect(batchCalls).toHaveLength(2);
    const firstBatch = batchCalls[0].input.RequestItems?.["BigTable"];
    const secondBatch = batchCalls[1].input.RequestItems?.["BigTable"];
    expect(firstBatch).toHaveLength(25);
    expect(secondBatch).toHaveLength(5);
  });

  it("returns empty resources array when no tables provided", async () => {
    const { client, docClient } = makeClients(async () => ({}));
    const report = await restoreDynamoDB(client, docClient, []);
    expect(report.service).toBe("dynamodb");
    expect(report.resources).toHaveLength(0);
  });
});
