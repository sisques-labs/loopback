import "server-only";

import { ListTablesCommand, DeleteTableCommand, type ListTablesCommandOutput } from "@aws-sdk/client-dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";

type DeleteResult = { deleted: string[]; failed: string[] };

/**
 * Dry-run overload: returns total table count without deleting anything.
 */
export async function resetDynamoDB(opts: { dryRun: true }): Promise<number>;
/**
 * Execute overload: deletes all tables, returns per-table results.
 */
export async function resetDynamoDB(opts?: { dryRun: false } | undefined): Promise<DeleteResult>;
export async function resetDynamoDB(
  opts?: { dryRun: boolean },
): Promise<number | DeleteResult> {
  const dryRun = opts?.dryRun ?? false;
  const client = await getDynamoDBClient();

  // Collect all table names (paginated)
  const tableNames: string[] = [];
  let lastEvaluated: string | undefined = undefined;
  do {
    const res: ListTablesCommandOutput = await client.send(
      new ListTablesCommand(
        lastEvaluated ? { ExclusiveStartTableName: lastEvaluated } : {},
      ),
    );
    for (const name of res.TableNames ?? []) {
      tableNames.push(name);
    }
    lastEvaluated = res.LastEvaluatedTableName;
  } while (lastEvaluated);

  if (dryRun) {
    return tableNames.length;
  }

  const deleted: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    tableNames.map(async (name) => {
      try {
        await client.send(new DeleteTableCommand({ TableName: name }));
        deleted.push(name);
      } catch {
        failed.push(name);
      }
    }),
  );

  return { deleted, failed };
}
