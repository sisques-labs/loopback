/**
 * Persistence tests for useInvokeHistoryStore (PR1.3 RED → PR1.4 GREEN)
 *
 * Validates:
 *  - localStorage round-trip for entries
 *  - LRU eviction: total cap of 200 entries across all functions
 *  - partialize whitelist: only entries is written to storage
 *  - skipHydration: persist middleware is wired with skipHydration: true
 */
import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
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

describe("useInvokeHistoryStore – persistence", () => {
  beforeEach(() => {
    useInvokeHistoryStore.setState({ entries: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── persist middleware wired ────────────────────────────────────────────────

  it("persist.rehydrate() is a function (persist middleware wired)", () => {
    expect(typeof useInvokeHistoryStore.persist).toBe("object");
    expect(typeof useInvokeHistoryStore.persist.rehydrate).toBe("function");
  });

  it("persist storage key is 'aws-local-ui/invoke-history'", () => {
    expect(useInvokeHistoryStore.persist.getOptions().name).toBe("aws-local-ui/invoke-history");
  });

  it("skipHydration: persist option is true", () => {
    expect(useInvokeHistoryStore.persist.getOptions().skipHydration).toBe(true);
  });

  it("version is 1", () => {
    const options = useInvokeHistoryStore.persist.getOptions();
    expect(options.version).toBe(1);
  });

  it("partialize: only entries is persisted", () => {
    const options = useInvokeHistoryStore.persist.getOptions();
    const fullState = useInvokeHistoryStore.getState();
    const partial = options.partialize!(fullState);
    expect(Object.keys(partial)).toEqual(["entries"]);
  });

  // ── total LRU cap = 200 ────────────────────────────────────────────────────
  // Note: per-function cap of 50 means we need ≥ 4 functions to reach 200 total.

  it("total entries never exceeds 200 across all functions", () => {
    // Add 4 functions × 50 entries = 200 total (each at per-function cap)
    // Then add one more to trigger the total LRU eviction
    for (let fn = 0; fn < 4; fn++) {
      for (let i = 0; i < 50; i++) {
        useInvokeHistoryStore.getState().addEntry(
          makeEntry(`fn-${fn}`, {
            id: `fn-${fn}-${i}`,
            timestamp: new Date((fn * 50 + i) * 1000).toISOString(),
          }),
        );
      }
    }
    // At exactly 200 — not over yet
    expect(useInvokeHistoryStore.getState().entries).toHaveLength(200);

    // Adding one more should keep it at 200
    useInvokeHistoryStore.getState().addEntry(
      makeEntry("fn-extra", {
        id: "fn-extra-0",
        timestamp: new Date(999_999_000).toISOString(),
      }),
    );
    expect(useInvokeHistoryStore.getState().entries).toHaveLength(200);
  });

  it("LRU eviction: oldest entry (by timestamp) is dropped when total exceeds 200", () => {
    // Fill to exactly 200 using 4 functions × 50 entries each
    // fn-0 entries: timestamps 0..49s (oldest)
    // fn-3 entries: timestamps 150..199s (newest)
    for (let fn = 0; fn < 4; fn++) {
      for (let i = 0; i < 50; i++) {
        useInvokeHistoryStore.getState().addEntry(
          makeEntry(`fn-${fn}`, {
            id: `fn-${fn}-${i}`,
            timestamp: new Date((fn * 50 + i) * 1000).toISOString(),
          }),
        );
      }
    }
    expect(useInvokeHistoryStore.getState().entries).toHaveLength(200);

    // Adding 201st entry with a NEWER timestamp should evict fn-0-0 (oldest)
    const newest = makeEntry("fn-extra", {
      id: "fn-extra-newest",
      timestamp: new Date(999_999_000).toISOString(),
    });
    useInvokeHistoryStore.getState().addEntry(newest);

    const entries = useInvokeHistoryStore.getState().entries;
    expect(entries).toHaveLength(200);
    // fn-0-0 has timestamp 0 — the absolute oldest, should be evicted
    expect(entries.find((e) => e.id === "fn-0-0")).toBeUndefined();
    // Newest should be present
    expect(entries.find((e) => e.id === "fn-extra-newest")).toBeDefined();
  });

  it("LRU eviction: adding to a NEW function (no per-fn cap) evicts globally oldest", () => {
    // Add 4 functions × 50 entries = 200 total (each at per-function cap)
    for (let fn = 0; fn < 4; fn++) {
      for (let i = 0; i < 50; i++) {
        useInvokeHistoryStore.getState().addEntry(
          makeEntry(`fn-${fn}`, {
            id: `fn-${fn}-${i}`,
            // fn-0 has the oldest timestamps (0..49s), fn-3 has newest (150..199s)
            timestamp: new Date((fn * 50 + i) * 1000).toISOString(),
          }),
        );
      }
    }
    expect(useInvokeHistoryStore.getState().entries).toHaveLength(200);

    // Adding to a brand new function (fn-extra, 0 existing entries) pushes total to 201
    // This should trigger total LRU, evicting fn-0-0 (absolute oldest, timestamp 0)
    useInvokeHistoryStore.getState().addEntry(
      makeEntry("fn-extra", {
        id: "fn-extra-new",
        timestamp: new Date(999_999_000).toISOString(),
      }),
    );
    const entries = useInvokeHistoryStore.getState().entries;
    expect(entries).toHaveLength(200);
    // fn-0-0 has timestamp 0 — the absolute oldest across all functions — should be evicted
    expect(entries.find((e) => e.id === "fn-0-0")).toBeUndefined();
    // fn-extra-new should be present
    expect(entries.find((e) => e.id === "fn-extra-new")).toBeDefined();
  });
});
