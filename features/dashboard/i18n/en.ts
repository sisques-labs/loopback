const dict = {
  page: {
    title: "Dashboard",
    subtitle: "Your local AWS environment",
  },
  connection: {
    title: "Connection",
    connected: "Connected",
    unreachable: "Unreachable",
    degraded: "Degraded",
  },
  errors: {
    connectFailed: "Connection failed",
    connectFailedDetail: "Could not reach the endpoint at {endpoint}.",
    retry: "Retry",
  },
  services: {
    comingSoon: "Coming soon",
  },
  serviceHealthPanel: {
    title: "LocalStack Service Status",
    services: {
      S3: "S3",
      SQS: "SQS",
      DynamoDB: "DynamoDB",
      Lambda: "Lambda",
      SNS: "SNS",
    },
    status: {
      healthy: "Healthy",
      degraded: "Degraded",
      unreachable: "Unreachable",
    },
    hint: "Check LocalStack is running",
    columns: {
      service: "Service",
      status: "Status",
    },
  },
} as const;

export default dict;
export type DashboardDict = typeof dict;
