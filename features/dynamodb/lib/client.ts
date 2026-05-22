import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createAwsConfig } from "@/lib/aws/config";
import { withInspectorMiddleware } from "@/lib/aws/inspector-middleware";

/**
 * Returns a fresh DynamoDBClient on every call.
 *
 * IMPORTANT: There is intentionally NO module-level singleton cache here.
 * The endpoint is resolved from the httpOnly cookie on every request via
 * createAwsConfig(), so that a UI-set endpoint override takes effect
 * immediately without a process restart.
 *
 * Do NOT add a cache — that would reintroduce the stale-endpoint bug.
 */
export async function getDynamoDBClient(): Promise<DynamoDBClient> {
  const config = await createAwsConfig();
  return withInspectorMiddleware(new DynamoDBClient(config), "DynamoDB");
}

/**
 * Returns a fresh DynamoDBDocumentClient on every call.
 *
 * Same no-cache guarantee as getDynamoDBClient (see above).
 */
export async function getDynamoDBDocumentClient(): Promise<DynamoDBDocumentClient> {
  const client = await getDynamoDBClient();
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
}
