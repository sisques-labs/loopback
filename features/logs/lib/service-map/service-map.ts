const KNOWN_SERVICES = ["lambda", "s3", "sqs", "sns", "dynamodb"] as const;
type KnownService = (typeof KNOWN_SERVICES)[number];

export function mapLogGroupToService(logGroupName: string): string {
  // Match /aws/<service>/... prefix convention
  const awsPrefix = /^\/aws\/([^/]+)/i.exec(logGroupName);
  if (awsPrefix) {
    return awsPrefix[1].toLowerCase();
  }

  // Flat name: check for known service tokens as whole words (case-insensitive)
  const lower = logGroupName.toLowerCase();
  for (const service of KNOWN_SERVICES) {
    const regex = new RegExp(`\\b${service}\\b`, "i");
    if (regex.test(lower)) {
      return service;
    }
  }

  return "unknown";
}
