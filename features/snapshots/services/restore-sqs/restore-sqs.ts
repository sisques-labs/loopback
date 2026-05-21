import "server-only";

import {
  CreateQueueCommand,
  type SQSClient,
} from "@aws-sdk/client-sqs";
import type {
  SQSQueueSnapshot,
  RestoreServiceReport,
  RestoreResourceResult,
} from "@/features/snapshots/lib/types/snapshot";

// Safe attributes to send to CreateQueue — excludes endpoint-specific and volatile attributes
const SAFE_ATTRS = new Set([
  "VisibilityTimeout",
  "MessageRetentionPeriod",
  "MaximumMessageSize",
  "DelaySeconds",
  "ReceiveMessageWaitTimeSeconds",
  "FifoQueue",
  "ContentBasedDeduplication",
]);

export async function restoreSQS(
  client: SQSClient,
  queues: SQSQueueSnapshot[],
): Promise<RestoreServiceReport> {
  const resources: RestoreResourceResult[] = [];

  for (const queue of queues) {
    // Filter to only safe attributes — do NOT send QueueArn or volatile attrs
    const safeAttributes: Record<string, string> = {};
    for (const [key, value] of Object.entries(queue.attributes)) {
      if (SAFE_ATTRS.has(key)) {
        safeAttributes[key] = value;
      }
    }

    try {
      await client.send(
        new CreateQueueCommand({
          QueueName: queue.queueName,
          Attributes: Object.keys(safeAttributes).length > 0 ? safeAttributes : undefined,
        }),
      );
      resources.push({ name: queue.queueName, status: "created" });
    } catch (err) {
      if (err instanceof Error && err.name === "QueueAlreadyExists") {
        resources.push({ name: queue.queueName, status: "skipped" });
      } else {
        resources.push({ name: queue.queueName, status: "failed", error: String(err) });
      }
    }
  }

  return { service: "sqs", resources };
}
