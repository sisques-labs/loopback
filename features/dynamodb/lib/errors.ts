type FriendlyError = {
  code: string;
  message: string;
};

type DynamoDBErrorsDict = {
  notFound: string;
  resourceInUse: string;
  resourceNotFound: string;
  validation: string;
  conditionalCheckFailed: string;
  limitExceeded: string;
  endpointUnreachable: string;
  unknown: string;
};

const DEFAULT_DICT: DynamoDBErrorsDict = {
  notFound: "The specified resource does not exist.",
  resourceInUse: "The resource is currently in use.",
  resourceNotFound: "The specified table does not exist.",
  validation: "Invalid request parameters.",
  conditionalCheckFailed: "A condition specified in the operation could not be evaluated.",
  limitExceeded: "Too many requests. Please try again.",
  endpointUnreachable:
    "Cannot connect to LocalStack at {endpoint}. Make sure it is running.",
  unknown: "An unexpected error occurred.",
};

export function toFriendlyError(err: unknown, dict?: DynamoDBErrorsDict): FriendlyError {
  const d = dict ?? DEFAULT_DICT;

  if (err instanceof Error) {
    const name = err.name;

    if (name === "ResourceNotFoundException") {
      return { code: name, message: d.resourceNotFound };
    }

    if (name === "ResourceInUseException") {
      return { code: name, message: d.resourceInUse };
    }

    if (name === "ValidationException") {
      return { code: name, message: d.validation };
    }

    if (name === "ConditionalCheckFailedException") {
      return { code: name, message: d.conditionalCheckFailed };
    }

    if (name === "LimitExceededException" || name === "ProvisionedThroughputExceededException") {
      return { code: name, message: d.limitExceeded };
    }

    const cause = (err as NodeJS.ErrnoException).code;
    if (cause === "ECONNREFUSED" || cause === "ENOTFOUND") {
      const endpoint = process.env.AWS_ENDPOINT_URL ?? "unknown";
      return {
        code: "EndpointUnreachable",
        message: d.endpointUnreachable.replace("{endpoint}", endpoint),
      };
    }

    return { code: name || "UnknownError", message: err.message || d.unknown };
  }

  return { code: "UnknownError", message: String(err) };
}
