type FriendlyError = {
  code: string;
  message: string;
};

export function toFriendlyError(err: unknown): FriendlyError {
  if (err instanceof Error) {
    const name = err.name;

    if (name === "QueueDoesNotExist" || name === "AWS.SimpleQueueService.NonExistentQueue") {
      return { code: "QueueDoesNotExist", message: "The specified queue does not exist." };
    }

    if (name === "QueueNameExists" || name === "QueueAlreadyExists") {
      return {
        code: "QueueNameExists",
        message: "A queue with this name already exists in the account.",
      };
    }

    if (name === "InvalidParameterValue" || name === "InvalidParameter") {
      return { code: "InvalidParameterValue", message: "Invalid queue parameter." };
    }

    if (name === "BatchRequestTooLong" || name === "MessageTooLong") {
      return {
        code: "MessageTooLong",
        message: "Message body exceeds the maximum allowed size.",
      };
    }

    if (name === "OverLimit" || name === "AWS.SimpleQueueService.TooManyEntriesInBatchRequest") {
      return { code: "OverLimit", message: "SQS request limit exceeded." };
    }

    if (name === "PurgeQueueInProgress") {
      return {
        code: "PurgeQueueInProgress",
        message: "A purge is already in progress for this queue.",
      };
    }

    if (name === "AccessDenied" || name === "AccessDeniedException") {
      return {
        code: "AccessDenied",
        message: "Not authorized to perform this SQS action.",
      };
    }

    const cause = (err as NodeJS.ErrnoException).code;
    if (cause === "ECONNREFUSED" || cause === "ENOTFOUND") {
      const endpoint = process.env.AWS_ENDPOINT_URL ?? "unknown";
      return {
        code: "EndpointUnreachable",
        message: `Cannot connect to LocalStack at ${endpoint}. Make sure it is running.`,
      };
    }

    return { code: name || "UnknownError", message: err.message };
  }

  return { code: "UnknownError", message: String(err) };
}
