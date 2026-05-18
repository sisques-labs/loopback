const dict = {
  title: "CloudWatch Logs",
  description: "Stream, filter, and search log entries from the configured AWS endpoint.",
  filters: {
    service: "Service",
    level: "Level",
    allServices: "All services",
    allLevels: "All levels",
  },
  search: {
    placeholder: "Search logs...",
    label: "Search",
  },
  entry: {
    level: {
      info: "INFO",
      warn: "WARN",
      error: "ERROR",
      unknown: "UNKNOWN",
    },
  },
  status: {
    idle: "Not connected",
    polling: "Live",
    error: "Connection error",
  },
  autoScroll: {
    enable: "Auto-scroll",
  },
  empty: "No log entries",
  noMatch: "No matches for current filters",
  updatedAt: "Updated {time} ago",
  errors: {
    fetchFailed: "Failed to fetch logs",
  },
  actions: {
    clearBuffer: "Clear logs",
  },
} as const;

export default dict;
export type LogsDict = typeof dict;
