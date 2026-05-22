import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { InvokeHistoryEntry } from "@/features/lambda/types/lambda";

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_ENTRIES_PER_FUNCTION = 50;
const MAX_TOTAL_ENTRIES = 200;

// ── Types ──────────────────────────────────────────────────────────────────

type InvokeHistoryState = {
  entries: InvokeHistoryEntry[];
  addEntry: (entry: InvokeHistoryEntry) => void;
  clearHistory: (functionName: string) => void;
};

// ── Store ──────────────────────────────────────────────────────────────────

export const useInvokeHistoryStore = create<InvokeHistoryState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (entry) =>
        set((s) => {
          // 1. Per-function FIFO cap (existing behaviour — preserved)
          const functionEntries = s.entries.filter(
            (e) => e.functionName === entry.functionName,
          );
          const otherEntries = s.entries.filter(
            (e) => e.functionName !== entry.functionName,
          );

          let perFn = [...functionEntries, entry];
          if (perFn.length > MAX_ENTRIES_PER_FUNCTION) {
            perFn = perFn.slice(perFn.length - MAX_ENTRIES_PER_FUNCTION);
          }

          // 2. Total LRU cap across all functions
          let combined = [...otherEntries, ...perFn];
          if (combined.length > MAX_TOTAL_ENTRIES) {
            // Sort ascending by timestamp (ISO 8601 sorts lexicographically = chronologically)
            combined = combined
              .slice()
              .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
              .slice(combined.length - MAX_TOTAL_ENTRIES);
          }

          return { entries: combined };
        }),

      clearHistory: (functionName) =>
        set((s) => ({
          entries: s.entries.filter((e) => e.functionName !== functionName),
        })),
    }),
    {
      name: "aws-local-ui/invoke-history",
      storage: createJSONStorage(() =>
        typeof localStorage !== "undefined" && localStorage !== null
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } as Storage,
      ),
      partialize: (s) => ({ entries: s.entries }),
      skipHydration: true,
      version: 1,
    },
  ),
);

// ── Selectors ─────────────────────────────────────────────────────────────

export function selectEntriesForFunction(
  state: InvokeHistoryState,
  functionName: string,
): InvokeHistoryEntry[] {
  return state.entries.filter((e) => e.functionName === functionName);
}
