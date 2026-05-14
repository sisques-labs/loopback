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
    fifoLabel: "FIFO queue",
    fifoHint: "Name will be suffixed with .fifo automatically",
    nameFifoSuffix: ".fifo",
    nameFifoPlaceholder: "my-topic (auto-suffixed to my-topic.fifo)",
  },
  topicRowActions: {
    actions: "Topic actions",
    delete: "Delete",
    deleteTitle: "Delete topic",
    deleteConfirm:
      "Are you sure you want to delete {topic}? This action cannot be undone.",
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
