const dict = {
  title: "AWS Request Inspector",
  description: "Inspect every AWS SDK call made by Server Actions — filter, search, and replay.",
  toolbar: {
    filters: {
      service: {
        label: "Service",
        all: "All services",
      },
      status: {
        label: "Status",
        all: "All",
        success: "Success",
        error: "Error",
      },
      text: {
        placeholder: "Search operation or payload…",
      },
    },
    clearBuffer: "Clear",
    statusPolling: "Live",
    statusError: "Error",
    statusIdle: "Idle",
    lastUpdated: "Updated {time} ago",
  },
  empty: {
    title: "No requests yet",
    body: "AWS SDK calls made by Server Actions will appear here.",
  },
  card: {
    duration: "{ms}ms",
    attempts: "{n} attempts",
  },
  detail: {
    title: "Request Detail",
    input: "Input",
    output: "Output",
    attempts: "Attempts",
    duration: "Duration",
    timestamp: "Timestamp",
    error: "Error",
    closeLabel: "Close",
  },
} as const;

export default dict;
export type InspectorDict = typeof dict;
