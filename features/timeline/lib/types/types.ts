export type TimelineTimeRange = "1h" | "6h" | "24h" | "all";

export type TimelineEventLevel = "info" | "warn" | "error" | "unknown";

export type TimelineStoreStatus = "idle" | "polling" | "error";

export interface TimelineEvent {
  eventId: string;
  timestamp: number; // epoch ms
  message: string;
  level?: TimelineEventLevel;
  service: string; // from mapLogGroupToService
  logGroupName: string; // kept for debugging context
}
