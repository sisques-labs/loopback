import { create } from "zustand";
import type { LogEntry, LogFilters } from "@/features/logs/lib/types/types";
import { getLogEventsAction } from "@/features/logs/use-cases/get-log-events";

// ── Constants ──────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2000;
const BUFFER_CAP = 1000;
const INITIAL_WINDOW_MS = 60_000;

// ── Module-scoped internals (NOT in serialized state) ──────────────────────

const OVERLAP_MS = 5_000;

let intervalRef: ReturnType<typeof setInterval> | null = null;
let cursor: string | undefined = undefined;
let lastPollTime = 0;
const seenIds = new Set<string>();

// ── Types ──────────────────────────────────────────────────────────────────

export type LogStoreStatus = "idle" | "polling" | "error";

type LogStoreState = {
  entries: LogEntry[];
  isPolling: boolean;
  autoScroll: boolean;
  status: LogStoreStatus;
  lastUpdatedAt: number | null;
  filters: LogFilters;
  startPolling(): void;
  stopPolling(): void;
  setFilter(key: keyof LogFilters, value: string | undefined): void;
  toggleAutoScroll(): void;
  setAutoScroll(value: boolean): void;
  clearBuffer(): void;
};

// ── Store ──────────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
  const since = lastPollTime > 0 ? lastPollTime - OVERLAP_MS : Date.now() - INITIAL_WINDOW_MS;
  const result = await getLogEventsAction({
    since,
    nextToken: cursor,
  });

  if (result.status === "error") {
    useLogsStore.setState({ status: "error" });
    return;
  }

  if (result.status === "success") {
    const { entries: incoming, nextToken } = result.data;
    cursor = nextToken;
    lastPollTime = Date.now();

    if (incoming.length === 0) {
      useLogsStore.setState({ status: "polling" });
      return;
    }

    useLogsStore.setState((s) => {
      // Deduplicate by id
      const novel = incoming.filter((e) => !seenIds.has(e.id));
      novel.forEach((e) => seenIds.add(e.id));

      if (novel.length === 0) return { status: "polling" };

      // Merge and trim to cap (keep newest)
      const merged = [...s.entries, ...novel];
      const trimmed =
        merged.length > BUFFER_CAP ? merged.slice(merged.length - BUFFER_CAP) : merged;

      return {
        entries: trimmed,
        status: "polling",
        lastUpdatedAt: Date.now(),
      };
    });
  }
}

export const useLogsStore = create<LogStoreState>((set, get) => ({
  entries: [],
  isPolling: false,
  autoScroll: true,
  status: "idle",
  lastUpdatedAt: null,
  filters: { service: "", level: "all", text: "" },

  startPolling() {
    if (get().isPolling) return;

    set({ isPolling: true, status: "polling" });

    // Immediate first poll
    void poll();

    intervalRef = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);
  },

  stopPolling() {
    if (intervalRef !== null) {
      clearInterval(intervalRef);
      intervalRef = null;
    }
    cursor = undefined;
    lastPollTime = 0;
    set({ isPolling: false, status: "idle" });
  },

  setFilter(key, value) {
    set((s) => ({
      filters: { ...s.filters, [key]: value ?? "" },
    }));
  },

  toggleAutoScroll() {
    set((s) => ({ autoScroll: !s.autoScroll }));
  },

  setAutoScroll(value: boolean) {
    set({ autoScroll: value });
  },

  clearBuffer() {
    seenIds.clear();
    cursor = undefined;
    set({ entries: [] });
  },
}));
