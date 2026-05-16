type FriendlyError = {
  code: string;
  message: string;
};

type SqsErrorsDict = {
  invalidParam: string;
  notFound: string;
  limitExceeded: string;
  notAuthorized: string;
  endpointUnreachable: string;
  unknown: string;
  receiptHandleInvalid?: string;
};

const DEFAULT_DICT: SqsErrorsDict = {
  invalidParam: "Invalid queue parameter.",
  notFound: "The specified queue does not exist.",
  limitExceeded: "Queue limit exceeded for this account.",
  notAuthorized: "Not authorized to perform this SQS action.",
  endpointUnreachable: "Cannot connect to LocalStack at {endpoint}. Make sure it is running.",
  unknown: "An unexpected error occurred.",
  receiptHandleInvalid:
    "This message's visibility window expired — receive a new batch to retry.",
};

export function toFriendlyError(err: unknown, dict?: SqsErrorsDict): FriendlyError {
  const d = dict ?? DEFAULT_DICT;

  if (err instanceof Error) {
    const name = err.name;

    if (name === "QueueDoesNotExist" || name === "AWS.SimpleQueueService.NonExistentQueue") {
      return { code: "QueueDoesNotExist", message: d.notFound };
    }

    if (name === "QueueNameExists" || name === "QueueAlreadyExists") {
      return {
        code: "QueueNameExists",
        message: "A queue with this name already exists in the account.",
      };
    }

    if (name === "InvalidParameterValue" || name === "InvalidParameter") {
      return { code: "InvalidParameterValue", message: d.invalidParam };
    }

    if (name === "BatchRequestTooLong" || name === "MessageTooLong") {
      return {
        code: "MessageTooLong",
        message: "Message body exceeds the maximum allowed size.",
      };
    }

    if (name === "OverLimit" || name === "AWS.SimpleQueueService.TooManyEntriesInBatchRequest") {
      return { code: "OverLimit", message: d.limitExceeded };
    }

    if (name === "PurgeQueueInProgress") {
      return {
        code: "PurgeQueueInProgress",
        message: "A purge is already in progress for this queue.",
      };
    }

    if (name === "AccessDenied" || name === "AccessDeniedException") {
      return { code: "AccessDenied", message: d.notAuthorized };
    }

    if (name === "ReceiptHandleIsInvalid" || name === "ReceiptHandleExpired") {
      return {
        code: name,
        message:
          d.receiptHandleInvalid ??
          "This message's visibility window expired — receive a new batch to retry.",
      };
    }

    const cause = (err as NodeJS.ErrnoException).code;
    if (cause === "ECONNREFUSED" || cause === "ENOTFOUND") {
      const endpoint = process.env.AWS_ENDPOINT_URL ?? "unknown";
      return {
        code: "EndpointUnreachable",
        message: d.endpointUnreachable.replace("{endpoint}", endpoint),
      };
    }

    return { code: name || "UnknownError", message: err.message };
  }

  return { code: "UnknownError", message: String(err) };
}
