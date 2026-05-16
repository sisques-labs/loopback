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
} as const;

export default dict;
export type DashboardDict = typeof dict;
