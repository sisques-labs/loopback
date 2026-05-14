export type Topic = {
  arn: string;
  name: string; // last segment of ARN: arn:aws:sns:<region>:<account>:<name>
  displayName?: string; // optional — from GetTopicAttributes
  isFifo: boolean; // derived from name.endsWith(".fifo")
};

export type TopicAttributes = {
  DisplayName?: string;
  SubscriptionsConfirmed?: string;
  SubscriptionsPending?: string;
  SubscriptionsDeleted?: string;
  TopicArn?: string;
  FifoTopic?: string; // "true" | "false"
  Owner?: string;
};
