import { describe, beforeEach, expect, it } from "vitest";
import {
  useInvokeHistoryStore,
  selectEntriesForFunction,
} from "./use-invoke-history-store";
import type { InvokeHistoryEntry } from "@/features/lambda/types/lambda";

function makeEntry(
  functionName: string,
  overrides: Partial<InvokeHistoryEntry> = {},
): InvokeHistoryEntry {
  return {
    id: crypto.randomUUID(),
    functionName,
    payloadHash: "abcd1234",
    statusCode: 200,
    duration: 100,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe("useInvokeHistoryStore", () => {
  beforeEach(() => {
    useInvokeHistoryStore.setState({ entries: [] });
  });

  it("addEntry stores an entry in the flat entries array", () => {
    const entry = makeEntry("fn-a");
    useInvokeHistoryStore.getState().addEntry(entry);
    const state = useInvokeHistoryStore.getState();
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]).toEqual(entry);
  });

  it("addEntry stores entries for different functions independently", () => {
    useInvokeHistoryStore.getState().addEntry(makeEntry("fn-a"));
    useInvokeHistoryStore.getState().addEntry(makeEntry("fn-b"));
    const state = useInvokeHistoryStore.getState();
    expect(state.entries).toHaveLength(2);
  });

  it("addEntry within cap — stores up to 50 entries per function", () => {
    const entries = Array.from({ length: 49 }, () => makeEntry("fn-a"));
    entries.forEach((e) => useInvokeHistoryStore.getState().addEntry(e));
    const newEntry = makeEntry("fn-a");
    useInvokeHistoryStore.getState().addEntry(newEntry);
    const forFn = selectEntriesForFunction(useInvokeHistoryStore.getState(), "fn-a");
    expect(forFn).toHaveLength(50);
    expect(forFn[forFn.length - 1]).toEqual(newEntry);
  });

  it("addEntry enforces FIFO eviction at 50 — oldest entry is dropped", () => {
    const oldest = makeEntry("fn-a", { timestamp: new Date(1000).toISOString() });
    useInvokeHistoryStore.getState().addEntry(oldest);
    // Fill to cap with 49 more entries
    Array.from({ length: 49 }, () => makeEntry("fn-a", { timestamp: new Date().toISOString() })).forEach(
      (e) => useInvokeHistoryStore.getState().addEntry(e),
    );
    // Adding one more should evict oldest
    const newest = makeEntry("fn-a", { timestamp: new Date(Date.now() + 9999).toISOString() });
    useInvokeHistoryStore.getState().addEntry(newest);
    const forFn = selectEntriesForFunction(useInvokeHistoryStore.getState(), "fn-a");
    expect(forFn).toHaveLength(50);
    expect(forFn.find((e) => e.id === oldest.id)).toBeUndefined();
    expect(forFn[forFn.length - 1]).toEqual(newest);
  });

  it("clearHistory removes only entries for the specified function", () => {
    useInvokeHistoryStore.getState().addEntry(makeEntry("fn-a"));
    useInvokeHistoryStore.getState().addEntry(makeEntry("fn-a"));
    useInvokeHistoryStore.getState().addEntry(makeEntry("fn-b"));
    useInvokeHistoryStore.getState().clearHistory("fn-a");
    const state = useInvokeHistoryStore.getState();
    expect(selectEntriesForFunction(state, "fn-a")).toHaveLength(0);
    expect(selectEntriesForFunction(state, "fn-b")).toHaveLength(1);
  });

  it("selectEntriesForFunction returns only entries for the given function", () => {
    useInvokeHistoryStore.getState().addEntry(makeEntry("fn-a"));
    useInvokeHistoryStore.getState().addEntry(makeEntry("fn-b"));
    const state = useInvokeHistoryStore.getState();
    const forA = selectEntriesForFunction(state, "fn-a");
    expect(forA).toHaveLength(1);
    expect(forA[0].functionName).toBe("fn-a");
  });

  it("entries with functionError are stored correctly (auto-expand is a UI concern)", () => {
    const errorEntry = makeEntry("fn-a", { functionError: "Runtime.ExitError" });
    useInvokeHistoryStore.getState().addEntry(errorEntry);
    const state = useInvokeHistoryStore.getState();
    const forFn = selectEntriesForFunction(state, "fn-a");
    expect(forFn[0].functionError).toBe("Runtime.ExitError");
  });

  it("store resets between setState calls (state is not locked)", () => {
    useInvokeHistoryStore.getState().addEntry(makeEntry("fn-a"));
    useInvokeHistoryStore.setState({ entries: [] });
    expect(useInvokeHistoryStore.getState().entries).toHaveLength(0);
  });
});
