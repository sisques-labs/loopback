import "server-only";

import { ScanCommand, type AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { ScanResult } from "@/features/dynamodb/types/dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import { encodeScanStartKey } from "@/features/dynamodb/lib/route-codec";

export async function scanTable(
  tableName: string,
  startKey?: Record<string, AttributeValue>,
): Promise<ScanResult> {
  try {
    const client = await getDynamoDBClient();

    const res = await client.send(
      new ScanCommand({
        TableName: tableName,
        Limit: 50,
        ExclusiveStartKey: startKey,
      }),
    );

    const items = (res.Items ?? []).map((item) =>
      unmarshall(item) as Record<string, unknown>,
    );

    const nextKey = encodeScanStartKey(res.LastEvaluatedKey as Record<string, AttributeValue> | undefined);

    return { items, nextKey };
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
