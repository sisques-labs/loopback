import "server-only";

import { ListQueuesCommand, DeleteQueueCommand } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/features/sqs/lib/client";

type DeleteResult = { deleted: string[]; failed: string[] };

/**
 * Dry-run overload: returns total queue count without deleting anything.
 */
export async function resetSQS(opts: { dryRun: true }): Promise<number>;
/**
 * Execute overload: deletes all queues, returns per-queue results.
 */
export async function resetSQS(opts?: { dryRun: false } | undefined): Promise<DeleteResult>;
export async function resetSQS(
  opts?: { dryRun: boolean },
): Promise<number | DeleteResult> {
  const dryRun = opts?.dryRun ?? false;
  const client = await getSQSClient();

  // Collect all queue URLs (paginated)
  const urls: string[] = [];
  let nextToken: string | undefined = undefined;
  do {
    const res = await client.send(
      new ListQueuesCommand({ ...(nextToken ? { NextToken: nextToken } : {}) }),
    );
    for (const url of res.QueueUrls ?? []) {
      urls.push(url);
    }
    nextToken = res.NextToken;
  } while (nextToken);

  if (dryRun) {
    return urls.length;
  }

  const deleted: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    urls.map(async (queueUrl) => {
      try {
        await client.send(new DeleteQueueCommand({ QueueUrl: queueUrl }));
        deleted.push(queueUrl);
      } catch {
        failed.push(queueUrl);
      }
    }),
  );

  return { deleted, failed };
}
