import "server-only";

import {
  ListTablesCommand,
  DescribeTableCommand,
  ScanCommand,
  type DynamoDBClient,
  type AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type {
  DynamoDBTableSnapshot,
  DynamoDBAttributeDefinition,
  DynamoDBKeySchema,
} from "@/features/snapshots/lib/types/snapshot";

const ITEM_WARN_THRESHOLD = 10_000;
const ITEM_REJECT_THRESHOLD = 50_000;

export async function captureDynamoDB(
  client: DynamoDBClient,
): Promise<{ tables: DynamoDBTableSnapshot[]; warnings: string[] }> {
  const warnings: string[] = [];
  const tables: DynamoDBTableSnapshot[] = [];

  // 1. List all tables (paginated by LastEvaluatedTableName)
  const tableNames: string[] = [];
  let exclusiveStartTableName: string | undefined;

  do {
    const res = await client.send(
      new ListTablesCommand({ ExclusiveStartTableName: exclusiveStartTableName }),
    );
    for (const name of res.TableNames ?? []) {
      tableNames.push(name);
    }
    exclusiveStartTableName = res.LastEvaluatedTableName;
  } while (exclusiveStartTableName);

  // 2. For each table: DescribeTable + paginated Scan
  for (const tableName of tableNames) {
    const descRes = await client.send(
      new DescribeTableCommand({ TableName: tableName }),
    );
    const tableDesc = descRes.Table!;

    // Paginated scan — accumulate all items
    const rawItems: Record<string, AttributeValue>[] = [];
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined;

    do {
      const scanRes = await client.send(
        new ScanCommand({
          TableName: tableName,
          ExclusiveStartKey: lastEvaluatedKey,
        }),
      );
      for (const item of scanRes.Items ?? []) {
        rawItems.push(item as Record<string, AttributeValue>);
      }
      lastEvaluatedKey = scanRes.LastEvaluatedKey as
        | Record<string, AttributeValue>
        | undefined;
    } while (lastEvaluatedKey);

    const itemCount = rawItems.length;

    // Guard: reject tables exceeding 50K items
    if (itemCount > ITEM_REJECT_THRESHOLD) {
      warnings.push(
        `Table "${tableName}" has ${itemCount} items which exceeds the 50K limit — table skipped.`,
      );
      continue;
    }

    // Guard: warn on tables exceeding 10K items
    if (itemCount > ITEM_WARN_THRESHOLD) {
      warnings.push(
        `Table "${tableName}" has ${itemCount} items — this may be slow.`,
      );
    }

    const attributeDefinitions: DynamoDBAttributeDefinition[] = (
      tableDesc.AttributeDefinitions ?? []
    ).map((ad) => ({
      name: ad.AttributeName!,
      type: ad.AttributeType as "S" | "N" | "B",
    }));

    const keySchema: DynamoDBKeySchema[] = (tableDesc.KeySchema ?? []).map(
      (ks) => ({
        name: ks.AttributeName!,
        keyType: ks.KeyType as "HASH" | "RANGE",
      }),
    );

    const billingMode =
      tableDesc.BillingModeSummary?.BillingMode === "PROVISIONED"
        ? "PROVISIONED"
        : "PAY_PER_REQUEST";

    const items = rawItems.map((item) => unmarshall(item) as Record<string, unknown>);

    tables.push({
      tableName,
      billingMode,
      attributeDefinitions,
      keySchema,
      items,
      itemCount,
    });
  }

  return { tables, warnings };
}
