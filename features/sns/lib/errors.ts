type FriendlyError = {
  code: string;
  message: string;
};

type SnsErrorsDict = {
  notFound: string;
  invalidParam: string;
  limitExceeded: string;
  kmsError: string;
  notAuthorized: string;
  endpointUnreachable: string;
  unknown: string;
};

const DEFAULT_DICT: SnsErrorsDict = {
  notFound: "The specified topic does not exist.",
  invalidParam: "Invalid topic parameter.",
  limitExceeded: "Topic limit exceeded for this account.",
  kmsError: "The KMS key associated with this topic is not accessible.",
  notAuthorized: "Not authorized to perform this SNS action.",
  endpointUnreachable: "Cannot connect to LocalStack at {endpoint}. Make sure it is running.",
  unknown: "An unexpected error occurred.",
};

export function toFriendlyError(err: unknown, dict?: SnsErrorsDict): FriendlyError {
  const d = dict ?? DEFAULT_DICT;

  if (err instanceof Error) {
    const name = err.name;

    if (name === "NotFoundException") {
      return { code: name, message: d.notFound };
    }

    if (name === "InvalidParameterException" || name === "InvalidParameter") {
      return { code: name, message: d.invalidParam };
    }

    if (name === "TopicLimitExceeded" || name === "TopicLimitExceededException") {
      return { code: name, message: d.limitExceeded };
    }

    if (name === "KMSDisabledException" || name === "KMSAccessDeniedException") {
      return { code: name, message: d.kmsError };
    }

    if (name === "AuthorizationErrorException") {
      return { code: name, message: d.notAuthorized };
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
