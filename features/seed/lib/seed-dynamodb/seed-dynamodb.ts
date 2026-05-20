import "server-only";

import {
  CreateTableCommand,
  BillingMode,
} from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import type { DynamoDBResource } from "@/features/seed/presets/schema";

const SKIP_ERROR_NAMES = new Set(["ResourceInUseException"]);

type SeedResult = { created: string[]; skipped: string[]; failed: string[] };

/**
 * Creates DynamoDB tables for the given preset DynamoDB resources.
 * Per-table try/catch — one failure does not block others.
 * Uses PAY_PER_REQUEST billing and a single String partition key.
 */
export async function seedDynamoDB(
  tables: DynamoDBResource[],
): Promise<SeedResult> {
  if (tables.length === 0) return { created: [], skipped: [], failed: [] };

  const client = await getDynamoDBClient();
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    tables.map(async (table) => {
      try {
        await client.send(
          new CreateTableCommand({
            TableName: table.name,
            AttributeDefinitions: [
              { AttributeName: table.pk, AttributeType: "S" },
            ],
            KeySchema: [{ AttributeName: table.pk, KeyType: "HASH" }],
            BillingMode: BillingMode.PAY_PER_REQUEST,
          }),
        );
        created.push(table.name);
      } catch (err) {
        const name = (err as { name?: string }).name ?? "";
        if (SKIP_ERROR_NAMES.has(name)) {
          skipped.push(table.name);
        } else {
          failed.push(table.name);
        }
      }
    }),
  );

  return { created, skipped, failed };
}
