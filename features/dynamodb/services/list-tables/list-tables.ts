import "server-only";

import {
  ListTablesCommand,
  DescribeTableCommand,
  type ListTablesCommandOutput,
  type DescribeTableCommandOutput,
} from "@aws-sdk/client-dynamodb";
import type { DynamoDBTable } from "@/features/dynamodb/types/dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";

export async function listTables(): Promise<DynamoDBTable[]> {
  try {
    const client = await getDynamoDBClient();
    const tableNames: string[] = [];
    let lastEvaluatedTableName: string | undefined = undefined;

    // Paginate through all tables
    do {
      const res: ListTablesCommandOutput = await client.send(
        new ListTablesCommand({ ExclusiveStartTableName: lastEvaluatedTableName }),
      );
      for (const name of res.TableNames ?? []) {
        tableNames.push(name);
      }
      lastEvaluatedTableName = res.LastEvaluatedTableName;
    } while (lastEvaluatedTableName);

    // Describe each table to get full metadata
    const tables: DynamoDBTable[] = await Promise.all(
      tableNames.map(async (name) => {
        const res: DescribeTableCommandOutput = await client.send(
          new DescribeTableCommand({ TableName: name }),
        );
        const table = res.Table!;

        // Find PK and SK from KeySchema + AttributeDefinitions
        const pkSchema = table.KeySchema?.find((k) => k.KeyType === "HASH");
        const skSchema = table.KeySchema?.find((k) => k.KeyType === "RANGE");

        const getAttrType = (attrName: string | undefined): string => {
          if (!attrName) return "";
          return (
            table.AttributeDefinitions?.find((a) => a.AttributeName === attrName)
              ?.AttributeType ?? ""
          );
        };

        const partitionKeyName = pkSchema?.AttributeName ?? "";
        const sortKeyName = skSchema?.AttributeName;

        return {
          name: table.TableName ?? "",
          status: table.TableStatus ?? "",
          itemCount: table.ItemCount ?? 0,
          tableSizeBytes: table.TableSizeBytes ?? 0,
          partitionKeyName,
          partitionKeyType: getAttrType(partitionKeyName),
          sortKeyName,
          sortKeyType: sortKeyName ? getAttrType(sortKeyName) : undefined,
          creationDateTime: table.CreationDateTime?.toISOString(),
          billingMode: table.BillingModeSummary?.BillingMode ?? "PROVISIONED",
          gsiCount: table.GlobalSecondaryIndexes?.length ?? 0,
        };
      }),
    );

    return tables;
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
