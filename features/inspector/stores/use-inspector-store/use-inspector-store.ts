import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPersistStorage } from "@/features/shared/stores/no-op-storage";
import type { PersistStorage } from "zustand/middleware";
import type { RequestEntry, RequestFilters } from "@/features/inspector/lib/types/types";
import {
  getInspectorEntriesAction,
  clearInspectorBufferAction,
} from "@/features/inspector/use-cases/get-inspector-entries/get-inspector-entries";

// ── Lazy storage adapter ───────────────────────────────────────────────────────
// Resolves `getPersistStorage()` on EACH access so that test environments that
// stub `localStorage` after module import still work correctly.

type PersistedSlice = { filters: RequestFilters; view: "list" | "timeline" };

const lazyStorage: PersistStorage<PersistedSlice> = {
  getItem(name) {
    const raw = getPersistStorage().getItem(name);
    if (raw == null) return null;
    try {
      const parsed = JSON.parse(raw as string) as {
        state: Record<string, unknown>;
        version: number;
      };
      // Only restore the persisted slice (filters + view) — never entries.
      // This makes the store resilient to storage corruption or manual writes.
      const { filters, view } = parsed.state ?? {};
      return {
        state: { filters, view } as unknown as PersistedSlice,
        version: parsed.version,
      };
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    getPersistStorage().setItem(name, JSON.stringify(value));
  },
  removeItem(name) {
    getPersistStorage().removeItem(name);
  },
};

// ── Constants ──────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2000;
const BUFFER_CAP = 200;

// ── Types ──────────────────────────────────────────────────────────────────────

export type InspectorStoreStatus = "idle" | "polling" | "error";

export interface InspectorStoreState {
  entries: RequestEntry[]; // sorted desc by timestamp
  isPolling: boolean;
  status: InspectorStoreStatus;
  lastUpdatedAt: number | null;
  filters: RequestFilters;
  view: "list" | "timeline"; // defaults to "list"; PR3 adds timeline branch

  seedEntries(entries: RequestEntry[]): void;
  startPolling(): void;
  stopPolling(): void;
  setFilter<K extends keyof RequestFilters>(key: K, value: RequestFilters[K]): void;
  setView(view: "list" | "timeline"): void;
  clearBuffer(): Promise<void>;
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useInspectorStore = create<InspectorStoreState>()(
  persist(
    (set, get) => {
      let intervalRef: ReturnType<typeof setInterval> | null = null;
      const seenIds = new Set<string>();
      let visibilityHandler: (() => void) | null = null;

      async function poll(): Promise<void> {
        const result = await getInspectorEntriesAction({});
        if (result.status !== "success") {
          set({ status: result.status === "error" ? "error" : "polling" });
          return;
        }
        const incoming = result.data.entries;
        if (incoming.length === 0) {
          set({ status: "polling" });
          return;
        }
        set((s) => {
          // Sync seenIds with current store entries so that external setState
          // calls (e.g., test beforeEach resets) are reflected automatically.
          const currentIds = new Set(s.entries.map((e) => e.id));
          // Keep seenIds consistent: remove IDs no longer in entries, keep those still there
          for (const id of seenIds) {
            if (!currentIds.has(id)) seenIds.delete(id);
          }
          const novel = incoming.filter((e) => !seenIds.has(e.id));
          novel.forEach((e) => seenIds.add(e.id));
          if (novel.length === 0) return { status: "polling" };
          const merged = [...s.entries, ...novel].sort((a, b) => b.timestamp - a.timestamp);
          const trimmed = merged.length > BUFFER_CAP ? merged.slice(0, BUFFER_CAP) : merged;
          return { entries: trimmed, status: "polling", lastUpdatedAt: Date.now() };
        });
      }

      return {
        entries: [],
        isPolling: false,
        status: "idle",
        lastUpdatedAt: null,
        filters: { service: "", status: "all", text: "" },
        view: "list",

        seedEntries(entries) {
          entries.forEach((e) => seenIds.add(e.id));
          set({ entries: [...entries].sort((a, b) => b.timestamp - a.timestamp) });
        },

        startPolling() {
          if (get().isPolling) return;
          set({ isPolling: true, status: "polling" });
          void poll();
          intervalRef = setInterval(() => void poll(), POLL_INTERVAL_MS);
          if (typeof document !== "undefined") {
            visibilityHandler = () => {
              if (document.visibilityState === "hidden" && intervalRef !== null) {
                clearInterval(intervalRef);
                intervalRef = null;
              } else if (get().isPolling && intervalRef === null) {
                void poll();
                intervalRef = setInterval(() => void poll(), POLL_INTERVAL_MS);
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

        setFilter(key, value) {
          set((s) => ({ filters: { ...s.filters, [key]: value } }));
        },

        setView(view) {
          set({ view });
        },

        async clearBuffer() {
          await clearInspectorBufferAction();
          seenIds.clear();
          set({ entries: [], lastUpdatedAt: null });
        },
      };
    },
    {
      name: "aws-local-ui/inspector",
      storage: lazyStorage,
      partialize: (s) => ({ filters: s.filters, view: s.view }),
      skipHydration: true,
      version: 1,
    },
  ),
);
