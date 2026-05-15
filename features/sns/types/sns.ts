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

export type SubscriptionProtocol = "http" | "https" | "sqs" | "email";

export type Subscription = {
  subscriptionArn: string; // "PendingConfirmation" when not yet confirmed
  topicArn: string;
  protocol: SubscriptionProtocol;
  endpoint: string;
  owner: string;
};
