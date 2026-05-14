type FriendlyError = {
  code: string;
  message: string;
};

type LambdaErrorsDict = {
  notFound: string;
  invalidParam: string;
  tooManyRequests: string;
  serviceError: string;
  payloadTooLarge: string;
  endpointUnreachable: string;
  unknown: string;
  codeStorageExceeded: string;
  invalidZip: string;
};

const DEFAULT_DICT: LambdaErrorsDict = {
  notFound: "The specified function does not exist.",
  invalidParam: "Invalid function parameter.",
  tooManyRequests: "Too many requests. Please try again.",
  serviceError: "Lambda service error.",
  payloadTooLarge: "Payload is too large.",
  endpointUnreachable: "Cannot connect to LocalStack at {endpoint}. Make sure it is running.",
  unknown: "An unexpected error occurred.",
  codeStorageExceeded: "Account code storage limit exceeded.",
  invalidZip: "The uploaded file is not a valid Lambda deployment package.",
};

export function toFriendlyError(err: unknown, dict?: LambdaErrorsDict): FriendlyError {
  const d = dict ?? DEFAULT_DICT;

  if (err instanceof Error) {
    const name = err.name;

    if (name === "ResourceNotFoundException") {
      return { code: name, message: d.notFound };
    }

    if (name === "InvalidParameterValueException") {
      return { code: name, message: d.invalidParam };
    }

    if (name === "TooManyRequestsException") {
      return { code: name, message: d.tooManyRequests };
    }

    if (name === "ServiceException") {
      return { code: name, message: d.serviceError };
    }

    if (name === "RequestEntityTooLargeException") {
      return { code: name, message: d.payloadTooLarge };
    }

    if (name === "CodeStorageExceededException") {
      return { code: name, message: d.codeStorageExceeded };
    }

    if (name === "InvalidZipFileException") {
      return { code: name, message: d.invalidZip };
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
