import "server-only";

import { CreateQueueCommand } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/features/sqs/lib/client";
import type { SQSResource } from "@/features/seed/presets/schema";

const SKIP_ERROR_NAMES = new Set(["QueueAlreadyExists"]);

type SeedResult = { created: string[]; skipped: string[]; failed: string[] };

/**
 * Creates SQS queues for the given preset SQS resources.
 * Per-queue try/catch — one failure does not block others.
 */
export async function seedSQS(queues: SQSResource[]): Promise<SeedResult> {
  if (queues.length === 0) return { created: [], skipped: [], failed: [] };

  const client = await getSQSClient();
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    queues.map(async (queue) => {
      try {
        await client.send(
          new CreateQueueCommand({
            QueueName: queue.name,
            ...(queue.fifo ? { Attributes: { FifoQueue: "true" } } : {}),
          }),
        );
        created.push(queue.name);
      } catch (err) {
        const name = (err as { name?: string }).name ?? "";
        if (SKIP_ERROR_NAMES.has(name)) {
          skipped.push(queue.name);
        } else {
          failed.push(queue.name);
        }
      }
    }),
  );

  return { created, skipped, failed };
}
