import "server-only";

import { ListTopicsCommand, DeleteTopicCommand } from "@aws-sdk/client-sns";
import { getSNSClient } from "@/features/sns/lib/client";

type DeleteResult = { deleted: string[]; failed: string[] };

/**
 * Dry-run overload: returns total topic count without deleting anything.
 */
export async function resetSNS(opts: { dryRun: true }): Promise<number>;
/**
 * Execute overload: deletes all SNS topics, returns per-topic results.
 */
export async function resetSNS(opts?: { dryRun: false } | undefined): Promise<DeleteResult>;
export async function resetSNS(
  opts?: { dryRun: boolean },
): Promise<number | DeleteResult> {
  const dryRun = opts?.dryRun ?? false;
  const client = await getSNSClient();

  // Collect all topic ARNs (paginated)
  const arns: string[] = [];
  let nextToken: string | undefined = undefined;
  do {
    const res = await client.send(
      new ListTopicsCommand({ ...(nextToken ? { NextToken: nextToken } : {}) }),
    );
    for (const t of res.Topics ?? []) {
      if (t.TopicArn) arns.push(t.TopicArn);
    }
    nextToken = res.NextToken;
  } while (nextToken);

  if (dryRun) {
    return arns.length;
  }

  const deleted: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    arns.map(async (arn) => {
      try {
        await client.send(new DeleteTopicCommand({ TopicArn: arn }));
        deleted.push(arn);
      } catch {
        failed.push(arn);
      }
    }),
  );

  return { deleted, failed };
}
