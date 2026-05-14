type FriendlyError = {
  code: string;
  message: string;
};

export function toFriendlyError(err: unknown): FriendlyError {
  if (err instanceof Error) {
    const name = err.name;

    if (name === "NotFoundException") {
      return { code: "NotFoundException", message: "The specified topic does not exist." };
    }

    if (name === "InvalidParameterException" || name === "InvalidParameter") {
      return { code: "InvalidParameterException", message: "Invalid topic parameter." };
    }

    if (name === "TopicLimitExceeded" || name === "TopicLimitExceededException") {
      return { code: "TopicLimitExceeded", message: "Topic limit exceeded for this account." };
    }

    if (name === "KMSDisabledException" || name === "KMSAccessDeniedException") {
      return {
        code: name,
        message: "The KMS key associated with this topic is not accessible.",
      };
    }

    if (name === "AuthorizationErrorException") {
      return {
        code: "AuthorizationErrorException",
        message: "Not authorized to perform this SNS action.",
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
