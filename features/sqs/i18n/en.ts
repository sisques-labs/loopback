const dict = {
  page: {
    title: "SQS Queues",
    empty: "No queues found in this account.",
  },
  queueTable: {
    name: "Name",
    url: "Queue URL",
    type: "Type",
    typeFifo: "FIFO",
    typeStandard: "Standard",
  },
  queueDetailStub: {
    title: "Queue",
    description:
      "Full queue attributes and messaging tools will appear here in a later update. You can still bookmark this URL.",
    urlLabel: "Queue URL",
    back: "Back to queues",
  },
  errors: {
    connectFailed: "Failed to connect to SQS",
    connectFailedDetail:
      "Could not reach {endpoint}. Make sure LocalStack is running and AWS_ENDPOINT_URL is configured correctly.",
    connectFailedDetailGeneric:
      "Could not reach LocalStack from the app server. Ensure it is running, AWS_ENDPOINT_URL is correct, and set NEXT_PUBLIC_AWS_ENDPOINT_URL to the same URL (required for client-side hints when using a LAN IP).",
    queueNotFound: "Queue not found",
    queueNotFoundDetail:
      "LocalStack has no queue for this URL. It may have been deleted, LocalStack was reset, or the link is outdated.",
    backToQueues: "Back to queues",
    retry: "Retry",
  },
} as const;

export default dict;
export type SQSDict = typeof dict;
