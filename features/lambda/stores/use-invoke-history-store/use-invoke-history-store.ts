import { create } from "zustand";
import type { InvokeHistoryEntry } from "@/features/lambda/types/lambda";

const MAX_ENTRIES_PER_FUNCTION = 50;

type InvokeHistoryState = {
  entries: InvokeHistoryEntry[];
  addEntry: (entry: InvokeHistoryEntry) => void;
  clearHistory: (functionName: string) => void;
};

export const useInvokeHistoryStore = create<InvokeHistoryState>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((s) => {
      const functionEntries = s.entries.filter(
        (e) => e.functionName === entry.functionName,
      );
      const otherEntries = s.entries.filter(
        (e) => e.functionName !== entry.functionName,
      );

      let updatedFunctionEntries = [...functionEntries, entry];
      if (updatedFunctionEntries.length > MAX_ENTRIES_PER_FUNCTION) {
        // FIFO eviction: drop the oldest (first) entry
        updatedFunctionEntries = updatedFunctionEntries.slice(
          updatedFunctionEntries.length - MAX_ENTRIES_PER_FUNCTION,
        );
      }

      return { entries: [...otherEntries, ...updatedFunctionEntries] };
    }),
  clearHistory: (functionName) =>
    set((s) => ({
      entries: s.entries.filter((e) => e.functionName !== functionName),
    })),
}));

export function selectEntriesForFunction(
  state: InvokeHistoryState,
  functionName: string,
): InvokeHistoryEntry[] {
  return state.entries.filter((e) => e.functionName === functionName);
}
