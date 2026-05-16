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
  createQueueDialog: {
    trigger: "New queue",
    title: "Create queue",
    nameLabel: "Queue name",
    cancel: "Cancel",
    creating: "Creating…",
    submit: "Create",
    success: "Queue created successfully.",
    fifoLabel: "FIFO queue",
    fifoHint: "Name will be suffixed with .fifo automatically when needed.",
    namePlaceholder: "my-queue",
    nameFifoPlaceholder: "my-queue (becomes my-queue.fifo)",
  },
  createQueueValidation: {
    required: "Queue name is required.",
    standardCannotEndFifo:
      "Standard queue names cannot end with .fifo. Uncheck FIFO or use a FIFO queue.",
    nameTooLong: "Queue name must be at most 80 characters (including .fifo for FIFO queues).",
    fifoMustEndFifo: "FIFO queue names must end with .fifo.",
    fifoInvalidPrefix:
      "Queue name may only contain letters, numbers, hyphens, and underscores before .fifo.",
    standardInvalidPattern:
      "Queue name must be 1–80 characters: letters, numbers, hyphens, or underscores only.",
  },
  queueRowActions: {
    actions: "Queue actions",
    delete: "Delete",
    deleteTitle: "Delete queue",
    deleteConfirm:
      "Are you sure you want to delete {queue}? Messages in the queue will be removed. This action cannot be undone.",
    viewDetail: "View detail",
  },
  queueDetail: {
    back: "Back to queues",
    urlLabel: "Queue URL",
    attributesTitle: "Queue attributes",
    messagingTitle: "Messages",
    typeStandard: "Standard",
    typeFifo: "FIFO",
    sendMessage: {
      trigger: "Send message",
      title: "Send message to {queue}",
      bodyLabel: "Message body",
      bodyPlaceholder: "Plain text or JSON…",
      cancel: "Cancel",
      submitting: "Sending…",
      submit: "Send",
      successToast: "Message sent to {queue}.",
      invalidJson: "Invalid JSON syntax.",
      formatButton: "Format JSON",
    },
    receive: {
      trigger: "Receive messages",
      title: "Receive messages",
      description:
        "Fetches up to 5 messages with up to 2 seconds long polling. Messages are not deleted from the queue; visibility timeout may temporarily hide them.",
      empty: "No messages returned (queue may be empty or messages are in flight).",
      messageIdLabel: "Message ID",
      submitting: "Receiving…",
      requeue: {
        requeue: "Requeue",
        requeueing: "Requeueing…",
        requeueSuccess: "Message requeued.",
      },
    },
    purge: {
      trigger: "Purge queue",
      title: "Purge queue messages",
      description:
        "Purge removes all messages from {queue}. The queue itself is kept—this is not the same as deleting the queue. You cannot undo a purge.",
      confirmLabel: "Purge messages",
    },
  },
  validation: {
    queueUrlRequired: "Queue URL is required.",
    receiptHandleRequired: "Receipt handle is required.",
    messageRequired: "Message body cannot be empty.",
  },
  sdkErrors: {
    invalidParam: "Invalid queue parameter.",
    notFound: "The specified queue does not exist.",
    limitExceeded: "Queue limit exceeded for this account.",
    notAuthorized: "Not authorized to perform this SQS action.",
    endpointUnreachable: "Cannot connect to LocalStack at {endpoint}. Make sure it is running.",
    unknown: "An unexpected error occurred.",
    receiptHandleInvalid:
      "This message's visibility window expired — receive a new batch to retry.",
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
