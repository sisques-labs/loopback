const dict = {
  page: {
    title: "SNS Topics",
    empty: "No topics found in this account.",
  },
  topicTable: {
    name: "Name",
    displayName: "Display Name",
    arn: "ARN",
    type: "Type",
    typeFifo: "FIFO",
    typeStandard: "Standard",
  },
  createTopicDialog: {
    trigger: "New topic",
    title: "Create topic",
    nameLabel: "Topic name",
    cancel: "Cancel",
    creating: "Creating…",
    submit: "Create",
    success: "Topic created successfully.",
  },
  topicRowActions: {
    actions: "Topic actions",
    delete: "Delete",
    deleteTitle: "Delete topic",
    deleteConfirm:
      "Are you sure you want to delete {topic}? This action cannot be undone.",
    viewDetail: "View detail",
    publish: "Publish message",
  },
  topicDetail: {
    title: "Topic Detail",
    arnLabel: "ARN",
    typeLabel: "Type",
    typeStandard: "Standard",
    typeFifo: "FIFO",
    subscriptionsConfirmed: "Confirmed Subscriptions",
    subscriptionsPending: "Pending Subscriptions",
    back: "Back to Topics",
    empty: "No subscriptions found",
  },
  subscriptionTable: {
    protocol: "Protocol",
    endpoint: "Endpoint",
    status: "Status",
    statusConfirmed: "Confirmed",
    statusPending: "Pending",
    unsubscribe: "Unsubscribe",
    unsubscribeTitle: "Unsubscribe",
    unsubscribeConfirm: "Unsubscribe {endpoint} from {topic}?",
  },
  subscribeDialog: {
    trigger: "Subscribe",
    title: "Subscribe endpoint",
    protocolLabel: "Protocol",
    endpointLabel: "Endpoint",
    endpointPlaceholder: "e.g. https://example.com/webhook",
    cancel: "Cancel",
    submit: "Subscribe",
    submitting: "Subscribing…",
    fifoHint: "FIFO topics only support SQS subscriptions.",
  },
  publishDialog: {
    trigger: "Publish",
    title: "Publish message to {topic}",
    messageLabel: "Message",
    messagePlaceholder: "Message body…",
    subjectLabel: "Subject (optional)",
    cancel: "Cancel",
    submit: "Publish",
    submitting: "Publishing…",
    successToast: "Message published to {topic}.",
  },
  errors: {
    connectFailed: "Failed to connect to SNS",
    connectFailedDetail:
      "Could not reach {endpoint}. Make sure LocalStack is running and AWS_ENDPOINT_URL is configured correctly.",
    retry: "Retry",
  },
} as const;

export default dict;
export type SNSDict = typeof dict;
