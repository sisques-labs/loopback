import { describe, beforeEach, afterEach, expect, it, vi } from "vitest";
import type { RequestEntry } from "@/features/inspector/lib/types/types";

// Mock the server actions — must come before importing the store
vi.mock(
  "@/features/inspector/use-cases/get-inspector-entries/get-inspector-entries",
  () => ({
    getInspectorEntriesAction: vi.fn(),
    clearInspectorBufferAction: vi.fn(),
  }),
);

import { useInspectorStore } from "./use-inspector-store";
import {
  getInspectorEntriesAction,
  clearInspectorBufferAction,
} from "@/features/inspector/use-cases/get-inspector-entries/get-inspector-entries";

const mockGetEntries = vi.mocked(getInspectorEntriesAction);
const mockClearBuffer = vi.mocked(clearInspectorBufferAction);

function makeEntry(id: string, overrides: Partial<RequestEntry> = {}): RequestEntry {
  return {
    id,
    timestamp: Date.now(),
    service: "SQS",
    operation: "SendMessageCommand",
    input: {},
    output: {},
    durationMs: 10,
    status: "success",
    attempts: 1,
    ...overrides,
  };
}

const INITIAL_STATE = {
  entries: [] as RequestEntry[],
  isPolling: false,
  status: "idle" as const,
  lastUpdatedAt: null as number | null,
  filters: { service: "", status: "all" as const, text: "" },
  view: "list" as const,
};

describe("useInspectorStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetEntries.mockResolvedValue({ status: "success", data: { entries: [] } });
    mockClearBuffer.mockResolvedValue({ status: "success", data: undefined });
    useInspectorStore.setState({ ...INITIAL_STATE });
  });

  afterEach(() => {
    useInspectorStore.getState().stopPolling();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── initial state ──────────────────────────────────────────────────────────

  it("initialises with empty entries, not polling, idle status, list view", () => {
    const s = useInspectorStore.getState();
    expect(s.entries).toEqual([]);
    expect(s.isPolling).toBe(false);
    expect(s.status).toBe("idle");
    expect(s.view).toBe("list");
    expect(s.filters).toEqual({ service: "", status: "all", text: "" });
  });

  // ── seedEntries ───────────────────────────────────────────────────────────

  it("seedEntries populates and sorts entries descending by timestamp", () => {
    const old = makeEntry("old", { timestamp: 1000 });
    const recent = makeEntry("recent", { timestamp: 2000 });
    useInspectorStore.getState().seedEntries([old, recent]);
    const entries = useInspectorStore.getState().entries;
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe("recent");
    expect(entries[1].id).toBe("old");
  });

  it("seedEntries replaces existing entries", () => {
    useInspectorStore.setState({ entries: [makeEntry("stale")] });
    useInspectorStore.getState().seedEntries([makeEntry("fresh")]);
    expect(useInspectorStore.getState().entries).toHaveLength(1);
    expect(useInspectorStore.getState().entries[0].id).toBe("fresh");
  });

  // ── setFilter ─────────────────────────────────────────────────────────────

  it("setFilter updates the specified filter key", () => {
    useInspectorStore.getState().setFilter("service", "DynamoDB");
    expect(useInspectorStore.getState().filters.service).toBe("DynamoDB");
    expect(useInspectorStore.getState().filters.status).toBe("all");
    expect(useInspectorStore.getState().filters.text).toBe("");
  });

  it("setFilter can update status filter", () => {
    useInspectorStore.getState().setFilter("status", "error");
    expect(useInspectorStore.getState().filters.status).toBe("error");
  });

  it("setFilter does not touch entries", () => {
    useInspectorStore.setState({ entries: [makeEntry("e1")] });
    useInspectorStore.getState().setFilter("service", "S3");
    expect(useInspectorStore.getState().entries).toHaveLength(1);
  });

  // ── setView ────────────────────────────────────────────────────────────────

  it("setView updates view", () => {
    useInspectorStore.getState().setView("timeline");
    expect(useInspectorStore.getState().view).toBe("timeline");
  });

  // ── clearBuffer ────────────────────────────────────────────────────────────

  it("clearBuffer calls clearInspectorBufferAction and resets entries", async () => {
    useInspectorStore.setState({ entries: [makeEntry("e1"), makeEntry("e2")] });
    await useInspectorStore.getState().clearBuffer();
    expect(mockClearBuffer).toHaveBeenCalledOnce();
    expect(useInspectorStore.getState().entries).toHaveLength(0);
    expect(useInspectorStore.getState().lastUpdatedAt).toBeNull();
  });

  // ── startPolling / stopPolling ─────────────────────────────────────────────

  it("startPolling sets isPolling to true", () => {
    useInspectorStore.getState().startPolling();
    expect(useInspectorStore.getState().isPolling).toBe(true);
  });

  it("startPolling is idempotent — second call does nothing", async () => {
    useInspectorStore.getState().startPolling();
    useInspectorStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(mockGetEntries).toHaveBeenCalledTimes(1);
  });

  it("stopPolling sets isPolling to false", () => {
    useInspectorStore.getState().startPolling();
    useInspectorStore.getState().stopPolling();
    expect(useInspectorStore.getState().isPolling).toBe(false);
    expect(useInspectorStore.getState().status).toBe("idle");
  });

  it("stopPolling prevents further polls", async () => {
    mockGetEntries.mockResolvedValue({ status: "success", data: { entries: [] } });
    useInspectorStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    useInspectorStore.getState().stopPolling();
    vi.clearAllMocks();
    await vi.advanceTimersByTimeAsync(4000);
    await vi.advanceTimersByTimeAsync(0);
    expect(mockGetEntries).not.toHaveBeenCalled();
  });

  it("polls and merges novel entries sorted descending", async () => {
    const entries = [makeEntry("e1", { timestamp: 2000 }), makeEntry("e2", { timestamp: 1000 })];
    mockGetEntries.mockResolvedValueOnce({ status: "success", data: { entries } });
    useInspectorStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    const state = useInspectorStore.getState();
    expect(state.entries).toHaveLength(2);
    expect(state.entries[0].id).toBe("e1");
    expect(state.entries[1].id).toBe("e2");
  });

  it("deduplicates entries by id across polls", async () => {
    const entry = makeEntry("dup-1");
    mockGetEntries
      .mockResolvedValueOnce({ status: "success", data: { entries: [entry] } })
      .mockResolvedValue({ status: "success", data: { entries: [entry] } });

    useInspectorStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(0);

    expect(useInspectorStore.getState().entries).toHaveLength(1);
  });

  it("status transitions to error when action returns error", async () => {
    mockGetEntries.mockResolvedValue({ status: "error", message: "fail" });
    useInspectorStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useInspectorStore.getState().status).toBe("error");
  });

  it("status recovers to polling after error clears", async () => {
    mockGetEntries
      .mockResolvedValueOnce({ status: "error", message: "fail" })
      .mockResolvedValue({ status: "success", data: { entries: [] } });
    useInspectorStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useInspectorStore.getState().status).toBe("error");
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(0);
    expect(useInspectorStore.getState().status).toBe("polling");
  });

  it("lastUpdatedAt is set when novel entries arrive", async () => {
    mockGetEntries.mockResolvedValue({
      status: "success",
      data: { entries: [makeEntry("e1")] },
    });
    useInspectorStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useInspectorStore.getState().lastUpdatedAt).toBeTypeOf("number");
  });

  it("lastUpdatedAt remains null when no entries arrive", async () => {
    useInspectorStore.setState({ lastUpdatedAt: null });
    mockGetEntries.mockResolvedValue({ status: "success", data: { entries: [] } });
    useInspectorStore.getState().startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(useInspectorStore.getState().lastUpdatedAt).toBeNull();
  });

  // ── skipHydration ─────────────────────────────────────────────────────────

  it("store has skipHydration enabled (persist.rehydrate is a function)", () => {
    expect(typeof useInspectorStore.persist.rehydrate).toBe("function");
  });

  // ── partialize ────────────────────────────────────────────────────────────

  it("partialize persists only filters and view (not entries)", () => {
    const options = useInspectorStore.persist.getOptions();
    // Verify partialize returns only filters + view
    const full = {
      ...INITIAL_STATE,
      entries: [makeEntry("e1")],
      isPolling: true,
      status: "polling" as const,
      lastUpdatedAt: 123,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partial = options.partialize!(full as any) as Record<string, unknown>;
    expect(Object.keys(partial).sort()).toEqual(["filters", "view"]);
    expect(partial).not.toHaveProperty("entries");
    expect(partial).not.toHaveProperty("isPolling");
  });
});
