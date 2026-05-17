import "server-only";

import { ListSubscriptionsByTopicCommand } from "@aws-sdk/client-sns";
import { getSNSClient } from "@/features/sns/lib/client";
import type { Subscription } from "@/features/sns/types/sns";

export async function listSubscriptionsByTopic(topicArn: string): Promise<Subscription[]> {
  const client = await getSNSClient();
  const res = await client.send(new ListSubscriptionsByTopicCommand({ TopicArn: topicArn }));
  return (res.Subscriptions ?? []).map((s) => ({
    subscriptionArn: s.SubscriptionArn ?? "",
    topicArn: s.TopicArn ?? "",
    protocol: (s.Protocol ?? "http") as Subscription["protocol"],
    endpoint: s.Endpoint ?? "",
    owner: s.Owner ?? "",
  }));
}
