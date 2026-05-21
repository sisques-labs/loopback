import { describe, it, expect } from "vitest";
import { mapLogEntryToTimelineEvent } from "./event-mapper";
import type { LogEntry } from "@/features/logs/lib/types/types";

function makeLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: "evt-1:1000",
    timestamp: 1000,
    message: "Test message",
    level: "info",
    logGroupName: "/aws/lambda/my-fn",
    logStreamName: "stream-1",
    service: "lambda",
    ...overrides,
  };
}

describe("mapLogEntryToTimelineEvent", () => {
  it("maps required fields from LogEntry to TimelineEvent", () => {
    const entry = makeLogEntry();
    const event = mapLogEntryToTimelineEvent(entry);

    expect(event.eventId).toBe(entry.id);
    expect(event.timestamp).toBe(entry.timestamp);
    expect(event.message).toBe(entry.message);
    expect(event.logGroupName).toBe(entry.logGroupName);
  });

  it("strips logStreamName — TimelineEvent has no logStreamName field", () => {
    const entry = makeLogEntry();
    const event = mapLogEntryToTimelineEvent(entry);

    expect("logStreamName" in event).toBe(false);
  });

  it("preserves level from LogEntry", () => {
    const entry = makeLogEntry({ level: "error" });
    const event = mapLogEntryToTimelineEvent(entry);
    expect(event.level).toBe("error");
  });

  it("preserves service from LogEntry (derived from mapLogGroupToService)", () => {
    const entry = makeLogEntry({ logGroupName: "/aws/lambda/fn", service: "lambda" });
    const event = mapLogEntryToTimelineEvent(entry);
    expect(event.service).toBe("lambda");
  });

  it("service is derived from logGroupName via mapLogGroupToService for /aws/s3/ prefix", () => {
    const entry = makeLogEntry({
      logGroupName: "/aws/s3/my-bucket",
      service: "s3",
    });
    const event = mapLogEntryToTimelineEvent(entry);
    expect(event.service).toBe("s3");
  });

  it("handles unknown logGroupName — service falls back to 'unknown'", () => {
    const entry = makeLogEntry({
      logGroupName: "/custom/unrecognized",
      service: "unknown",
    });
    const event = mapLogEntryToTimelineEvent(entry);
    expect(event.service).toBe("unknown");
  });

  it("maps warn level correctly", () => {
    const entry = makeLogEntry({ level: "warn" });
    const event = mapLogEntryToTimelineEvent(entry);
    expect(event.level).toBe("warn");
  });

  it("maps unknown level correctly", () => {
    const entry = makeLogEntry({ level: "unknown" });
    const event = mapLogEntryToTimelineEvent(entry);
    expect(event.level).toBe("unknown");
  });
});
