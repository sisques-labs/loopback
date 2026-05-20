import type { LogEntry } from "@/features/logs/lib/types/types";
import type { TimelineEvent } from "../types/types";

export function mapLogEntryToTimelineEvent(entry: LogEntry): TimelineEvent {
  return {
    eventId: entry.id,
    timestamp: entry.timestamp,
    message: entry.message,
    level: entry.level,
    service: entry.service,
    logGroupName: entry.logGroupName,
  };
}
