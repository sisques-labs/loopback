import "server-only";

import {
  CreateTableCommand,
  BatchWriteItemCommand,
  type DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type {
  DynamoDBTableSnapshot,
  RestoreServiceReport,
  RestoreResourceResult,
} from "@/features/snapshots/lib/types/snapshot";

const BATCH_SIZE = 25;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function restoreDynamoDB(
  client: DynamoDBClient,
  docClient: DynamoDBDocumentClient,
  tables: DynamoDBTableSnapshot[],
): Promise<RestoreServiceReport> {
  const resources: RestoreResourceResult[] = [];

  for (const table of tables) {
    let status: RestoreResourceResult["status"] = "created";

    // 1. Create table — skip if already exists
    try {
      await client.send(
        new CreateTableCommand({
          TableName: table.tableName,
          BillingMode: table.billingMode,
          AttributeDefinitions: table.attributeDefinitions.map((ad) => ({
            AttributeName: ad.name,
            AttributeType: ad.type,
          })),
          KeySchema: table.keySchema.map((ks) => ({
            AttributeName: ks.name,
            KeyType: ks.keyType,
          })),
          ...(table.billingMode === "PROVISIONED" && table.provisionedThroughput
            ? {
                ProvisionedThroughput: {
                  ReadCapacityUnits: table.provisionedThroughput.readCapacityUnits,
                  WriteCapacityUnits: table.provisionedThroughput.writeCapacityUnits,
                },
              }
            : {}),
        }),
      );
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "ResourceInUseException"
      ) {
        status = "skipped";
      } else {
        resources.push({ name: table.tableName, status: "failed", error: String(err) });
        continue;
      }
    }

    // 2. Write items in batches of 25
    if (table.items.length > 0) {
      const chunks = chunkArray(table.items, BATCH_SIZE);
      for (const chunk of chunks) {
        await (docClient as unknown as DynamoDBClient).send(
          new BatchWriteItemCommand({
            RequestItems: {
              [table.tableName]: chunk.map((item) => ({
                PutRequest: { Item: marshall(item) },
              })),
            },
          }),
        );
      }
    }

    resources.push({ name: table.tableName, status });
  }

  return { service: "dynamodb", resources };
}
