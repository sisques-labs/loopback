const dict = {
  /** Page-level metadata */
  title: "Event Timeline",
  description: "Real-time visual event log across all LocalStack services.",
  loading: "Loading events...",
  /** Time range selector labels (also used by toolbar) */
  timeRange: {
    label: "Time range",
    "1h": "Last hour",
    "6h": "Last 6 hours",
    "24h": "Last 24 hours",
    all: "All time",
  },
  /** Toolbar status + last-updated copy */
  toolbar: {
    timeRange: {
      label: "Time range",
      "1h": "Last hour",
      "6h": "Last 6 hours",
      "24h": "Last 24 hours",
      all: "All time",
    },
    statusPolling: "Polling",
    statusError: "Error",
    statusIdle: "Idle",
    lastUpdated: "Updated {time}",
  },
  /** Empty state copy */
  empty: {
    title: "No events found",
    body: "No events were found for the selected time range. Make sure LocalStack is running and services are being invoked.",
  },
} as const;

export default dict;
export type TimelineDict = typeof dict;
