import { describe, beforeEach, afterEach, expect, it, vi } from "vitest";
import type { LogEntry } from "@/features/logs/lib/criteria/types";

// Mock the server action — must come before importing the store
vi.mock("@/features/logs/use-cases/get-log-events", () => ({
  getLogEventsAction: vi.fn(),
}));

import { useLogsStore } from "./use-logs-store";
import { getLogEventsAction } from "@/features/logs/use-cases/get-log-events";

const mockGetLogEventsAction = vi.mocked(getLogEventsAction);

function makeEntry(id: string, overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id,
    timestamp: Date.now(),
    message: `message-${id}`,
    level: "info",
    logGroupName: "/aws/lambda/fn",
    logStreamName: "stream-1",
    service: "lambda",
    ...overrides,
  };
}

const INITIAL_STATE = {
  entries: [],
  isPolling: false,
  autoScroll: true,
  filters: { service: "", level: "all" as const, text: "" },
};

describe("useLogsStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetLogEventsAction.mockResolvedValue({ status: "idle" });
    useLogsStore.setState({ ...INITIAL_STATE, status: "idle", lastUpdatedAt: null });
  });

  afterEach(() => {
    useLogsStore.getState().stopPolling();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── T19: initial state ──────────────────────────────────────────────────

  it("initialises with empty entries, not polling, autoScroll=true, idle status", () => {
    const s = useLogsStore.getState();
    expect(s.entries).toEqual([]);
    expect(s.isPolling).toBe(false);
    expect(s.autoScroll).toBe(true);
    expect(s.filters).toEqual({ service: "", level: "all", text: "" });
  });

  // ── T19: startPolling sets isPolling=true ───────────────────────────────

  it("startPolling sets isPolling to true", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    expect(useLogsStore.getState().isPolling).toBe(true);
  });

  // ── T19: startPolling calls action immediately ──────────────────────────

  it("startPolling calls getLogEventsAction immediately", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(mockGetLogEventsAction).toHaveBeenCalledTimes(1);
  });

  // ── T19: startPolling is idempotent ─────────────────────────────────────

  it("startPolling is idempotent — second call does nothing", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    // Only one immediate call, not two
    expect(mockGetLogEventsAction).toHaveBeenCalledTimes(1);
  });

  // ── T19: deduplication by id ────────────────────────────────────────────

  it("appending entries deduplicates by id", async () => {
    const entry = makeEntry("dup-1");
    mockGetLogEventsAction
      .mockResolvedValueOnce({
        status: "success",
        data: { entries: [entry], nextToken: undefined },
      })
      .mockResolvedValue({
        status: "success",
        data: { entries: [entry], nextToken: undefined }, // same id again
      });

    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    // Advance timer to trigger second poll
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(0);

    expect(useLogsStore.getState().entries).toHaveLength(1);
    expect(useLogsStore.getState().entries[0].id).toBe("dup-1");
  });

  // ── T19: buffer cap ─────────────────────────────────────────────────────

  it("buffer cap: when at 1000 entries, 10 new ones drop 10 oldest", async () => {
    // Prefill to 1000
    const existing = Array.from({ length: 1000 }, (_, i) =>
      makeEntry(`old-${i}`, { timestamp: i }),
    );
    useLogsStore.setState({ entries: existing });

    const newEntries = Array.from({ length: 10 }, (_, i) =>
      makeEntry(`new-${i}`, { timestamp: 2000 + i }),
    );
    mockGetLogEventsAction.mockResolvedValueOnce({
      status: "success",
      data: { entries: newEntries, nextToken: undefined },
    });

    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);

    const state = useLogsStore.getState();
    expect(state.entries).toHaveLength(1000);
    // The 10 new ones should be present
    expect(state.entries.some((e) => e.id === "new-0")).toBe(true);
    // The 10 oldest should be gone
    expect(state.entries.some((e) => e.id === "old-0")).toBe(false);
    expect(state.entries.some((e) => e.id === "old-9")).toBe(false);
    // old-10 should still be present
    expect(state.entries.some((e) => e.id === "old-10")).toBe(true);
  });

  // ── T19: setFilter merges without touching entries ──────────────────────

  it("setFilter merges without touching entries", () => {
    const entry = makeEntry("e1");
    useLogsStore.setState({ entries: [entry] });
    useLogsStore.getState().setFilter("service", "lambda");
    const s = useLogsStore.getState();
    expect(s.filters.service).toBe("lambda");
    expect(s.filters.level).toBe("all");
    expect(s.filters.text).toBe("");
    expect(s.entries).toHaveLength(1);
  });

  // ── T19: toggleAutoScroll flips boolean ────────────────────────────────

  it("toggleAutoScroll flips autoScroll from true to false", () => {
    useLogsStore.setState({ autoScroll: true });
    useLogsStore.getState().toggleAutoScroll();
    expect(useLogsStore.getState().autoScroll).toBe(false);
  });

  it("toggleAutoScroll flips autoScroll from false to true", () => {
    useLogsStore.setState({ autoScroll: false });
    useLogsStore.getState().toggleAutoScroll();
    expect(useLogsStore.getState().autoScroll).toBe(true);
  });

  it("setAutoScroll(false) sets autoScroll to false", () => {
    useLogsStore.setState({ autoScroll: true });
    useLogsStore.getState().setAutoScroll(false);
    expect(useLogsStore.getState().autoScroll).toBe(false);
  });

  it("setAutoScroll(true) sets autoScroll to true", () => {
    useLogsStore.setState({ autoScroll: false });
    useLogsStore.getState().setAutoScroll(true);
    expect(useLogsStore.getState().autoScroll).toBe(true);
  });

  // ── T19: clearBuffer ────────────────────────────────────────────────────

  it("clearBuffer empties entries but preserves filters", () => {
    useLogsStore.setState({
      entries: [makeEntry("e1")],
      filters: { service: "lambda", level: "info", text: "foo" },
    });
    useLogsStore.getState().clearBuffer();
    const s = useLogsStore.getState();
    expect(s.entries).toHaveLength(0);
    expect(s.filters).toEqual({ service: "lambda", level: "info", text: "foo" });
  });

  // ── T19: stopPolling ────────────────────────────────────────────────────

  it("stopPolling clears interval and sets isPolling=false", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    useLogsStore.getState().stopPolling();
    expect(useLogsStore.getState().isPolling).toBe(false);

    // Verify no more calls after stop
    vi.clearAllMocks();
    await vi.advanceTimersByTimeAsync(4000);
    await vi.advanceTimersByTimeAsync(0);
    expect(mockGetLogEventsAction).not.toHaveBeenCalled();
  });

  // ── T22: status transitions ─────────────────────────────────────────────

  it("status starts as idle", () => {
    expect(useLogsStore.getState().status).toBe("idle");
  });

  it("status transitions to polling on startPolling", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    expect(useLogsStore.getState().status).toBe("polling");
  });

  it("status transitions to error when action returns error", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "error",
      message: "Fetch failed",
    });
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useLogsStore.getState().status).toBe("error");
  });

  it("entries are preserved on error", async () => {
    const existing = [makeEntry("e1")];
    useLogsStore.setState({ entries: existing });
    mockGetLogEventsAction.mockResolvedValue({
      status: "error",
      message: "Fetch failed",
    });
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useLogsStore.getState().entries).toHaveLength(1);
    expect(useLogsStore.getState().entries[0].id).toBe("e1");
  });

  it("lastUpdatedAt is set to a number on successful poll", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [makeEntry("e1")], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useLogsStore.getState().lastUpdatedAt).toBeTypeOf("number");
  });

  it("lastUpdatedAt remains null when poll returns no entries yet", async () => {
    useLogsStore.setState({ lastUpdatedAt: null });
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    // lastUpdatedAt should stay null when no entries arrived
    expect(useLogsStore.getState().lastUpdatedAt).toBeNull();
  });

  it("status returns to polling (not error) on next successful poll after error", async () => {
    mockGetLogEventsAction
      .mockResolvedValueOnce({ status: "error", message: "oops" })
      .mockResolvedValue({
        status: "success",
        data: { entries: [], nextToken: undefined },
      });

    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useLogsStore.getState().status).toBe("error");

    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(0);
    expect(useLogsStore.getState().status).toBe("polling");
  });

  it("stopPolling transitions status to idle", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    useLogsStore.getState().stopPolling();
    expect(useLogsStore.getState().status).toBe("idle");
  });

  // ── W4: poll cursor advancement ─────────────────────────────────────────

  it("first poll uses INITIAL_WINDOW_MS window (60s back)", async () => {
    const before = Date.now();
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [], nextToken: undefined },
    });
    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);

    const call = mockGetLogEventsAction.mock.calls[0][0];
    expect(call.since).toBeLessThanOrEqual(before);
    expect(call.since).toBeGreaterThanOrEqual(before - 60_000 - 100); // 100ms tolerance
  });

  it("second poll uses advancing cursor (since ≈ lastPollTime - OVERLAP_MS)", async () => {
    mockGetLogEventsAction.mockResolvedValue({
      status: "success",
      data: { entries: [makeEntry("e1")], nextToken: undefined },
    });

    useLogsStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0); // first poll completes

    // Advance clock so second poll fires
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(0); // let second poll resolve

    // Second call should use a MUCH more recent since (not the original 60s window)
    const secondCall = mockGetLogEventsAction.mock.calls[1][0];
    const now = Date.now();
    // since should be approximately now - 5000 (OVERLAP_MS), not now - 60000
    expect(secondCall.since).toBeGreaterThan(now - 60_000);
    expect(secondCall.since).toBeLessThanOrEqual(now);
  });
});
