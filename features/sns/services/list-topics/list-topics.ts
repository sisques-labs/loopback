import "server-only";

import { ListTopicsCommand, GetTopicAttributesCommand } from "@aws-sdk/client-sns";
import type { Topic } from "@/features/sns/types/sns";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";

function nameFromArn(arn: string): string {
  const segments = arn.split(":");
  return segments[segments.length - 1] ?? arn;
}

export async function listTopics(): Promise<Topic[]> {
  try {
    const client = getSNSClient();

    // 1. Page through ListTopics until NextToken is empty.
    const arns: string[] = [];
    let nextToken: string | undefined = undefined;
    do {
      const res = await client.send(new ListTopicsCommand({ NextToken: nextToken }));
      for (const t of res.Topics ?? []) {
        if (t.TopicArn) arns.push(t.TopicArn);
      }
      nextToken = res.NextToken;
    } while (nextToken);

    // 2. Enrich each ARN with DisplayName via GetTopicAttributes.
    //    Done concurrently; defensive parsing — every attribute is optional.
    const topics = await Promise.all(
      arns.map(async (arn): Promise<Topic> => {
        const name = nameFromArn(arn);
        try {
          const { Attributes } = await client.send(
            new GetTopicAttributesCommand({ TopicArn: arn }),
          );
          return {
            arn,
            name,
            displayName: Attributes?.DisplayName || undefined,
            isFifo: name.endsWith(".fifo"),
          };
        } catch {
          // Topic exists in the list but attributes failed — fall back to bare topic.
          return { arn, name, isFifo: name.endsWith(".fifo") };
        }
      }),
    );

    return topics;
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
