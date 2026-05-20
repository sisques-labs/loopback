import "server-only";

import { CreateTopicCommand } from "@aws-sdk/client-sns";
import { getSNSClient } from "@/features/sns/lib/client";
import type { SNSResource } from "@/features/seed/presets/schema";

const SKIP_ERROR_NAMES = new Set(["TopicAlreadyExists"]);

type SeedResult = { created: string[]; skipped: string[]; failed: string[] };

/**
 * Creates SNS topics for the given preset SNS resources.
 * Per-topic try/catch — one failure does not block others.
 * SNS CreateTopic is natively idempotent (returns same ARN); TopicAlreadyExists
 * is recorded as skipped for any SNS implementation that throws it.
 */
export async function seedSNS(topics: SNSResource[]): Promise<SeedResult> {
  if (topics.length === 0) return { created: [], skipped: [], failed: [] };

  const client = await getSNSClient();
  const created: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    topics.map(async (topic) => {
      try {
        await client.send(new CreateTopicCommand({ Name: topic.name }));
        created.push(topic.name);
      } catch (err) {
        const name = (err as { name?: string }).name ?? "";
        if (SKIP_ERROR_NAMES.has(name)) {
          skipped.push(topic.name);
        } else {
          failed.push(topic.name);
        }
      }
    }),
  );

  return { created, skipped, failed };
}
