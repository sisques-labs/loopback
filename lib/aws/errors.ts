type FriendlyError = {
  code: string;
  message: string;
};

export function toFriendlyError(err: unknown): FriendlyError {
  if (err instanceof Error) {
    const name = err.name;

    if (name === "NoSuchBucket") {
      return { code: "NoSuchBucket", message: "The specified bucket does not exist." };
    }

    if (name === "BucketAlreadyExists" || name === "BucketAlreadyOwnedByYou") {
      return { code: name, message: "A bucket with that name already exists." };
    }

    if (name === "NoSuchKey") {
      return { code: "NoSuchKey", message: "The specified object does not exist." };
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
