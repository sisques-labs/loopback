import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TimelineEvent, TimelineTimeRange, TimelineStoreStatus } from "../../lib/types/types";
import { getTimelineEventsAction } from "../../use-cases/get-timeline-events/get-timeline-events";

// ── Constants ──────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;
const BUFFER_CAP = 1000;

// ── Types ──────────────────────────────────────────────────────────────────

export interface TimelineStoreState {
  // ── Data ────────────────────────────────────────────────
  events: TimelineEvent[];        // sorted desc by timestamp, capped at 1000
  isPolling: boolean;
  status: TimelineStoreStatus;
  lastUpdatedAt: number | null;

  // ── Filters ─────────────────────────────────────────────
  timeRange: TimelineTimeRange;   // default "1h"

  // ── Actions ─────────────────────────────────────────────
  seedEvents(events: TimelineEvent[]): void;
  startPolling(): void;
  stopPolling(): void;
  setTimeRange(range: TimelineTimeRange): void;
  clearBuffer(): void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useTimelineStore = create<TimelineStoreState>()(
  persist(
    (set, get) => {
  // ── Closure-scoped internals (per-store-instance, NOT module-scoped) ──────
  let intervalRef: ReturnType<typeof setInterval> | null = null;
  const seenIds = new Set<string>();
  let visibilityHandler: (() => void) | null = null;

  async function poll(): Promise<void> {
    const { timeRange } = get();
    const result = await getTimelineEventsAction({ timeRange });

    if (result.status === "error") {
      set({ status: "error" });
      return;
    }

    if (result.status === "success") {
      const { events: incoming } = result.data;

      if (incoming.length === 0) {
        set({ status: "polling" });
        return;
      }

      set((s) => {
        // Deduplicate by eventId
        const novel = incoming.filter((e) => !seenIds.has(e.eventId));
        novel.forEach((e) => seenIds.add(e.eventId));

        if (novel.length === 0) return { status: "polling" };

        // Merge, sort desc, trim to cap (keep newest — highest timestamps)
        const merged = [...s.events, ...novel].sort((a, b) => b.timestamp - a.timestamp);
        const trimmed = merged.length > BUFFER_CAP ? merged.slice(0, BUFFER_CAP) : merged;

        return {
          events: trimmed,
          status: "polling",
          lastUpdatedAt: Date.now(),
        };
      });
    }
  }

  return {
    events: [],
    isPolling: false,
    status: "idle",
    timeRange: "1h",
    lastUpdatedAt: null,

    seedEvents(events: TimelineEvent[]) {
      // Register seenIds so polls don't duplicate seeded events
      events.forEach((e) => seenIds.add(e.eventId));
      const sorted = [...events].sort((a, b) => b.timestamp - a.timestamp);
      set({ events: sorted });
    },

    startPolling() {
      if (get().isPolling) return;

      set({ isPolling: true, status: "polling" });

      // Immediate first poll
      void poll();

      intervalRef = setInterval(() => {
        void poll();
      }, POLL_INTERVAL_MS);

      // Page Visibility API — pause polling when tab is hidden
      if (typeof document !== "undefined") {
        visibilityHandler = () => {
          if (document.visibilityState === "hidden") {
            if (intervalRef !== null) {
              clearInterval(intervalRef);
              intervalRef = null;
            }
          } else {
            // Tab became visible again — resume
            if (get().isPolling && intervalRef === null) {
              void poll();
              intervalRef = setInterval(() => {
                void poll();
              }, POLL_INTERVAL_MS);
            }
          }
        };
        document.addEventListener("visibilitychange", visibilityHandler);
      }
    },

    stopPolling() {
      if (intervalRef !== null) {
        clearInterval(intervalRef);
        intervalRef = null;
      }
      if (visibilityHandler !== null && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", visibilityHandler);
        visibilityHandler = null;
      }
      set({ isPolling: false, status: "idle" });
    },

    setTimeRange(range: TimelineTimeRange) {
      // Reset dedup state so fresh window is fetched on next poll
      seenIds.clear();
      set({ timeRange: range, events: [], lastUpdatedAt: null });
    },

    clearBuffer() {
      seenIds.clear();
      set({ events: [] });
    },
  };
    },
    {
      name: "aws-local-ui/timeline",
      storage: createJSONStorage(() =>
        typeof localStorage !== "undefined" && localStorage !== null
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } as Storage,
      ),
      partialize: (s) => ({ timeRange: s.timeRange }),
      skipHydration: true,
      version: 1,
    },
  ),
);
