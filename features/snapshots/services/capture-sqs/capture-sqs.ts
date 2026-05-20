import "server-only";

import {
  ListQueuesCommand,
  GetQueueAttributesCommand,
  type SQSClient,
} from "@aws-sdk/client-sqs";
import type { SQSQueueSnapshot } from "@/features/snapshots/lib/types/snapshot";

// Volatile attributes that change over time and must not be snapshotted
const VOLATILE_ATTRS = new Set([
  "ApproximateNumberOfMessages",
  "ApproximateNumberOfMessagesNotVisible",
  "ApproximateNumberOfMessagesDelayed",
  "LastModifiedTimestamp",
  "CreatedTimestamp",
  "QueueArn",
]);

export async function captureSQS(
  client: SQSClient,
): Promise<SQSQueueSnapshot[]> {
  const queueUrls: string[] = [];

  // ListQueues is paginated via NextToken
  let nextToken: string | undefined;
  do {
    const res = await client.send(
      new ListQueuesCommand({ NextToken: nextToken }),
    );
    for (const url of res.QueueUrls ?? []) {
      queueUrls.push(url);
    }
    nextToken = res.NextToken;
  } while (nextToken);

  if (queueUrls.length === 0) return [];

  const snapshots: SQSQueueSnapshot[] = [];

  for (const queueUrl of queueUrls) {
    const attrsRes = await client.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ["All"],
      }),
    );

    const rawAttrs = attrsRes.Attributes ?? {};

    // Strip volatile attributes
    const attributes: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawAttrs)) {
      if (!VOLATILE_ATTRS.has(key)) {
        attributes[key] = value;
      }
    }

    // Queue name is the last path segment of the URL
    const queueName = queueUrl.split("/").at(-1) ?? queueUrl;
    const isFifo = rawAttrs.FifoQueue === "true";

    snapshots.push({ queueName, isFifo, attributes });
  }

  return snapshots;
}
