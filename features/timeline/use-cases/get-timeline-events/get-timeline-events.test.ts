import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
import type { LogEntry } from "@/features/logs/lib/types/types";

// Mock filterLogEvents — must come before importing the action
vi.mock(
  "@/features/logs/services/filter-log-events/filter-log-events",
  () => ({
    filterLogEvents: vi.fn(),
  }),
);

import { getTimelineEventsAction } from "./get-timeline-events";
import { filterLogEvents } from "@/features/logs/services/filter-log-events/filter-log-events";

const mockFilterLogEvents = vi.mocked(filterLogEvents);

const HOUR_MS = 60 * 60 * 1000;

function makeLogEntry(id: string, timestamp: number, overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id,
    timestamp,
    message: `message-${id}`,
    level: "info",
    logGroupName: "/aws/lambda/fn",
    logStreamName: "stream-1",
    service: "lambda",
    ...overrides,
  };
}

describe("getTimelineEventsAction", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_700_000_000_000);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── Time-range to startTime mapping ──────────────────────────────────────

  it("1h range calls filterLogEvents with startTime = now - 1h", async () => {
    mockFilterLogEvents.mockResolvedValue({ entries: [], nextToken: undefined });

    await getTimelineEventsAction({ timeRange: "1h" });

    expect(mockFilterLogEvents).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: 1_700_000_000_000 - 1 * HOUR_MS }),
    );
  });

  it("6h range calls filterLogEvents with startTime = now - 6h", async () => {
    mockFilterLogEvents.mockResolvedValue({ entries: [], nextToken: undefined });

    await getTimelineEventsAction({ timeRange: "6h" });

    expect(mockFilterLogEvents).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: 1_700_000_000_000 - 6 * HOUR_MS }),
    );
  });

  it("24h range calls filterLogEvents with startTime = now - 24h", async () => {
    mockFilterLogEvents.mockResolvedValue({ entries: [], nextToken: undefined });

    await getTimelineEventsAction({ timeRange: "24h" });

    expect(mockFilterLogEvents).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: 1_700_000_000_000 - 24 * HOUR_MS }),
    );
  });

  it("all range maps startTime: 0", async () => {
    mockFilterLogEvents.mockResolvedValue({ entries: [], nextToken: undefined });

    await getTimelineEventsAction({ timeRange: "all" });

    expect(mockFilterLogEvents).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: 0 }),
    );
  });

  // ── Return shape ──────────────────────────────────────────────────────────

  it("returns success ActionState with sorted-desc TimelineEvent[] on success", async () => {
    const entries = [
      makeLogEntry("a", 3000),
      makeLogEntry("b", 1000),
      makeLogEntry("c", 2000),
    ];
    mockFilterLogEvents.mockResolvedValue({ entries, nextToken: undefined });

    const result = await getTimelineEventsAction({ timeRange: "1h" });

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.events).toHaveLength(3);
      expect(result.data.events[0].timestamp).toBe(3000);
      expect(result.data.events[1].timestamp).toBe(2000);
      expect(result.data.events[2].timestamp).toBe(1000);
    }
  });

  it("maps LogEntry id to TimelineEvent eventId", async () => {
    const entries = [makeLogEntry("evt-xyz", 1000)];
    mockFilterLogEvents.mockResolvedValue({ entries, nextToken: undefined });

    const result = await getTimelineEventsAction({ timeRange: "1h" });

    if (result.status === "success") {
      expect(result.data.events[0].eventId).toBe("evt-xyz");
    }
  });

  it("returns empty events array when filterLogEvents returns no entries", async () => {
    mockFilterLogEvents.mockResolvedValue({ entries: [], nextToken: undefined });

    const result = await getTimelineEventsAction({ timeRange: "1h" });

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.events).toHaveLength(0);
    }
  });

  // ── Error handling ────────────────────────────────────────────────────────

  it("returns error ActionState when filterLogEvents throws", async () => {
    mockFilterLogEvents.mockRejectedValue(new Error("Network failure"));

    const result = await getTimelineEventsAction({ timeRange: "1h" });

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toContain("Network failure");
    }
  });

  it("does NOT throw when filterLogEvents rejects", async () => {
    mockFilterLogEvents.mockRejectedValue(new Error("boom"));

    await expect(getTimelineEventsAction({ timeRange: "1h" })).resolves.toBeDefined();
  });
});
