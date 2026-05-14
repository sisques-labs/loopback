import "server-only";

import { GetTopicAttributesCommand } from "@aws-sdk/client-sns";
import type { TopicAttributes } from "@/features/sns/types/sns";
import { getSNSClient } from "@/features/sns/lib/client";
import { toFriendlyError } from "@/features/sns/lib/errors";

export async function getTopicAttributes(topicArn: string): Promise<TopicAttributes> {
  try {
    const client = getSNSClient();
    const { Attributes } = await client.send(
      new GetTopicAttributesCommand({ TopicArn: topicArn }),
    );
    return {
      DisplayName: Attributes?.DisplayName,
      SubscriptionsConfirmed: Attributes?.SubscriptionsConfirmed,
      SubscriptionsPending: Attributes?.SubscriptionsPending,
      SubscriptionsDeleted: Attributes?.SubscriptionsDeleted,
      TopicArn: Attributes?.TopicArn,
      FifoTopic: Attributes?.FifoTopic,
      Owner: Attributes?.Owner,
    };
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    throw Object.assign(new Error(message), { name: code });
  }
}
