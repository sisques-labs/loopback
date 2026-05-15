import "server-only";

import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "@/features/dynamodb/lib/client";
import { toFriendlyError } from "@/features/dynamodb/lib/errors";

export async function getItem(
  tableName: string,
  key: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  try {
    const client = getDynamoDBDocumentClient();

    const res = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: key,
      }),
    );

    return res.Item ?? null;
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
