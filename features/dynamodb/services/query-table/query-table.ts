import "server-only";

import { QueryCommand, type AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { ScanResult } from "@/features/dynamodb/types/dynamodb";
import { getDynamoDBClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";
import { encodeScanStartKey } from "@/features/dynamodb/lib/route-codec";

export async function queryTable(
  tableName: string,
  pk: { name: string; value: string },
  sk?: { name: string; value: string },
  startKey?: Record<string, AttributeValue>,
): Promise<ScanResult> {
  try {
    const client = await getDynamoDBClient();

    const expressionAttributeNames: Record<string, string> = { "#pk": pk.name };
    const expressionAttributeValues: Record<string, AttributeValue> = {
      ":pk": { S: pk.value },
    };

    let keyConditionExpression = "#pk = :pk";

    if (sk) {
      expressionAttributeNames["#sk"] = sk.name;
      expressionAttributeValues[":sk"] = { S: sk.value };
      keyConditionExpression += " AND #sk = :sk";
    }

    const res = await client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: 50,
        ExclusiveStartKey: startKey,
      }),
    );

    const items = (res.Items ?? []).map((item) =>
      unmarshall(item) as Record<string, unknown>,
    );

    const nextKey = encodeScanStartKey(
      res.LastEvaluatedKey as Record<string, AttributeValue> | undefined,
    );

    return { items, nextKey };
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
