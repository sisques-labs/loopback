import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
import type { TimelineEvent } from "../../lib/types/types";

// Mock the server action — must come before importing the store
vi.mock(
  "../../use-cases/get-timeline-events/get-timeline-events",
  () => ({
    getTimelineEventsAction: vi.fn(),
  }),
);

import { useTimelineStore } from "./use-timeline-store";
import { getTimelineEventsAction } from "../../use-cases/get-timeline-events/get-timeline-events";

const mockGetTimelineEventsAction = vi.mocked(getTimelineEventsAction);

const POLL_INTERVAL_MS = 5000;

function makeEvent(id: string, timestamp: number, overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    eventId: id,
    timestamp,
    message: `message-${id}`,
    level: "info",
    service: "lambda",
    logGroupName: "/aws/lambda/fn",
    ...overrides,
  };
}

const INITIAL_STATE = {
  events: [],
  isPolling: false,
  status: "idle" as const,
  timeRange: "1h" as const,
  lastUpdatedAt: null,
};

describe("useTimelineStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetTimelineEventsAction.mockResolvedValue({ status: "idle" });
    useTimelineStore.setState({ ...INITIAL_STATE });
  });

  afterEach(() => {
    useTimelineStore.getState().stopPolling();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("initialises with empty events, not polling, idle status, timeRange=1h", () => {
    const s = useTimelineStore.getState();
    expect(s.events).toEqual([]);
    expect(s.isPolling).toBe(false);
    expect(s.status).toBe("idle");
    expect(s.timeRange).toBe("1h");
    expect(s.lastUpdatedAt).toBeNull();
  });

  // ── startPolling ──────────────────────────────────────────────────────────

  it("startPolling sets isPolling to true and status to polling", () => {
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "success",
      data: { events: [] },
    });
    useTimelineStore.getState().startPolling();
    const s = useTimelineStore.getState();
    expect(s.isPolling).toBe(true);
    expect(s.status).toBe("polling");
  });

  it("startPolling calls getTimelineEventsAction immediately", async () => {
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "success",
      data: { events: [] },
    });
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(mockGetTimelineEventsAction).toHaveBeenCalledTimes(1);
  });

  it("startPolling is idempotent — second call does nothing", async () => {
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "success",
      data: { events: [] },
    });
    useTimelineStore.getState().startPolling();
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(mockGetTimelineEventsAction).toHaveBeenCalledTimes(1);
  });

  it("startPolling calls action again after poll interval", async () => {
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "success",
      data: { events: [] },
    });
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    await vi.advanceTimersByTimeAsync(0);
    expect(mockGetTimelineEventsAction).toHaveBeenCalledTimes(2);
  });

  // ── Deduplication ─────────────────────────────────────────────────────────

  it("deduplicates events by eventId — same eventId not added twice", async () => {
    const event = makeEvent("evt-1", 1000);
    mockGetTimelineEventsAction
      .mockResolvedValueOnce({ status: "success", data: { events: [event] } })
      .mockResolvedValue({ status: "success", data: { events: [event] } });

    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    await vi.advanceTimersByTimeAsync(0);

    expect(useTimelineStore.getState().events).toHaveLength(1);
    expect(useTimelineStore.getState().events[0].eventId).toBe("evt-1");
  });

  // ── Buffer cap ────────────────────────────────────────────────────────────

  it("buffer cap: when at 1000 events, 10 new ones evict 10 oldest", async () => {
    const existing = Array.from({ length: 1000 }, (_, i) =>
      makeEvent(`old-${i}`, i),
    );
    useTimelineStore.setState({ events: existing });

    const newEvents = Array.from({ length: 10 }, (_, i) =>
      makeEvent(`new-${i}`, 2000 + i),
    );
    mockGetTimelineEventsAction.mockResolvedValueOnce({
      status: "success",
      data: { events: newEvents },
    });

    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);

    const state = useTimelineStore.getState();
    expect(state.events).toHaveLength(1000);
    expect(state.events.some((e) => e.eventId === "new-0")).toBe(true);
    expect(state.events.some((e) => e.eventId === "old-0")).toBe(false);
    expect(state.events.some((e) => e.eventId === "old-9")).toBe(false);
    expect(state.events.some((e) => e.eventId === "old-10")).toBe(true);
  });

  // ── Sort descending ───────────────────────────────────────────────────────

  it("events are sorted by timestamp descending after merge", async () => {
    const events = [
      makeEvent("a", 3000),
      makeEvent("b", 1000),
      makeEvent("c", 2000),
    ];
    mockGetTimelineEventsAction.mockResolvedValueOnce({
      status: "success",
      data: { events },
    });

    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);

    const state = useTimelineStore.getState();
    expect(state.events[0].timestamp).toBe(3000);
    expect(state.events[1].timestamp).toBe(2000);
    expect(state.events[2].timestamp).toBe(1000);
  });

  it("out-of-order batches maintain sort-desc invariant", async () => {
    const existing = [makeEvent("old-a", 5000)];
    useTimelineStore.setState({ events: existing });

    const incoming = [makeEvent("new-a", 7000), makeEvent("new-b", 3000), makeEvent("new-c", 9000)];
    mockGetTimelineEventsAction.mockResolvedValueOnce({
      status: "success",
      data: { events: incoming },
    });

    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);

    const resultEvents = useTimelineStore.getState().events;
    for (let i = 0; i < resultEvents.length - 1; i++) {
      expect(resultEvents[i].timestamp).toBeGreaterThanOrEqual(resultEvents[i + 1].timestamp);
    }
  });

  // ── stopPolling ───────────────────────────────────────────────────────────

  it("stopPolling sets isPolling=false and status=idle", async () => {
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "success",
      data: { events: [] },
    });
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    useTimelineStore.getState().stopPolling();

    expect(useTimelineStore.getState().isPolling).toBe(false);
    expect(useTimelineStore.getState().status).toBe("idle");
  });

  it("stopPolling clears interval — no more calls after stop", async () => {
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "success",
      data: { events: [] },
    });
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    useTimelineStore.getState().stopPolling();

    vi.clearAllMocks();
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3);
    await vi.advanceTimersByTimeAsync(0);
    expect(mockGetTimelineEventsAction).not.toHaveBeenCalled();
  });

  it("stopPolling is idempotent when not polling", () => {
    expect(() => useTimelineStore.getState().stopPolling()).not.toThrow();
    expect(useTimelineStore.getState().isPolling).toBe(false);
  });

  // ── setTimeRange ──────────────────────────────────────────────────────────

  it("setTimeRange updates timeRange state", () => {
    useTimelineStore.getState().setTimeRange("6h");
    expect(useTimelineStore.getState().timeRange).toBe("6h");
  });

  it("setTimeRange resets seenIds so dedup is fresh on next poll", async () => {
    const event = makeEvent("evt-1", 1000);
    mockGetTimelineEventsAction
      .mockResolvedValueOnce({ status: "success", data: { events: [event] } })
      .mockResolvedValue({ status: "success", data: { events: [event] } });

    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useTimelineStore.getState().events).toHaveLength(1);

    // Change range — should reset seenIds so the same event can appear again
    useTimelineStore.getState().stopPolling();
    useTimelineStore.getState().setTimeRange("6h");

    // Now start polling again — same event arrives again
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);

    // After range reset, the same event should be present (dedupe cleared)
    expect(useTimelineStore.getState().events).toHaveLength(1);
    expect(useTimelineStore.getState().events[0].eventId).toBe("evt-1");
  });

  // ── seedEvents ────────────────────────────────────────────────────────────

  it("seedEvents populates initial events and seenIds", async () => {
    const seeds = [makeEvent("seed-1", 2000), makeEvent("seed-2", 1000)];
    useTimelineStore.getState().seedEvents(seeds);

    expect(useTimelineStore.getState().events).toHaveLength(2);

    // After seeding, same event should not be duplicated on first poll
    mockGetTimelineEventsAction.mockResolvedValueOnce({
      status: "success",
      data: { events: [makeEvent("seed-1", 2000)] }, // duplicate id
    });

    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);

    expect(useTimelineStore.getState().events).toHaveLength(2); // still 2, not 3
  });

  it("seedEvents sorts events descending", () => {
    const seeds = [makeEvent("a", 1000), makeEvent("b", 3000), makeEvent("c", 2000)];
    useTimelineStore.getState().seedEvents(seeds);

    const evts = useTimelineStore.getState().events;
    expect(evts[0].timestamp).toBe(3000);
    expect(evts[1].timestamp).toBe(2000);
    expect(evts[2].timestamp).toBe(1000);
  });

  // ── clearBuffer ───────────────────────────────────────────────────────────

  it("clearBuffer empties events and preserves timeRange", () => {
    useTimelineStore.setState({
      events: [makeEvent("e1", 1000)],
      timeRange: "6h",
    });
    useTimelineStore.getState().clearBuffer();
    const s = useTimelineStore.getState();
    expect(s.events).toHaveLength(0);
    expect(s.timeRange).toBe("6h");
  });

  it("clearBuffer resets seenIds so events can be re-added", async () => {
    const event = makeEvent("evt-1", 1000);
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "success",
      data: { events: [event] },
    });

    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useTimelineStore.getState().events).toHaveLength(1);

    useTimelineStore.getState().clearBuffer();
    expect(useTimelineStore.getState().events).toHaveLength(0);

    // Same event should be re-added after clearBuffer
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    await vi.advanceTimersByTimeAsync(0);
    expect(useTimelineStore.getState().events).toHaveLength(1);
  });

  // ── Error handling ────────────────────────────────────────────────────────

  it("status transitions to error when action returns error", async () => {
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "error",
      message: "Fetch failed",
    });
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useTimelineStore.getState().status).toBe("error");
  });

  it("events are preserved on error", async () => {
    const existing = [makeEvent("e1", 1000)];
    useTimelineStore.setState({ events: existing });
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "error",
      message: "Fetch failed",
    });
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useTimelineStore.getState().events).toHaveLength(1);
  });

  it("status recovers to polling on next successful poll after error", async () => {
    mockGetTimelineEventsAction
      .mockResolvedValueOnce({ status: "error", message: "oops" })
      .mockResolvedValue({ status: "success", data: { events: [] } });

    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useTimelineStore.getState().status).toBe("error");

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    await vi.advanceTimersByTimeAsync(0);
    expect(useTimelineStore.getState().status).toBe("polling");
  });

  // ── lastUpdatedAt ─────────────────────────────────────────────────────────

  it("lastUpdatedAt is set to a number on successful poll with events", async () => {
    mockGetTimelineEventsAction.mockResolvedValue({
      status: "success",
      data: { events: [makeEvent("e1", 1000)] },
    });
    useTimelineStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useTimelineStore.getState().lastUpdatedAt).toBeTypeOf("number");
  });
});
