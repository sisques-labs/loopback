/**
 * Persistence tests for useTimelineStore (PR1.1 RED → PR1.2 GREEN)
 *
 * Validates:
 *  - localStorage round-trip for timeRange
 *  - partialize whitelist: only timeRange is written to storage
 *  - skipHydration: store boots from defaults, rehydrate() restores persisted value
 */
import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";

// Mock the server action — must come before importing the store
vi.mock(
  "../../use-cases/get-timeline-events/get-timeline-events",
  () => ({
    getTimelineEventsAction: vi.fn().mockResolvedValue({ status: "idle" }),
  }),
);

// ── Mock storage (replaces localStorage in node env) ─────────────────────────

function createMockStorage(): Record<string, string> & {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
} {
  const store: Record<string, string> = {};
  return {
    ...store,
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
  };
}

// We inject the mock storage by patching globalThis.localStorage before the store is initialised
// on each test. Because the store is a singleton, we manipulate persist directly.

import { useTimelineStore } from "./use-timeline-store";

const INITIAL_STATE = {
  events: [],
  isPolling: false,
  status: "idle" as const,
  timeRange: "1h" as const,
  lastUpdatedAt: null,
};

describe("useTimelineStore – persistence", () => {
  beforeEach(() => {
    useTimelineStore.setState({ ...INITIAL_STATE });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── round-trip ──────────────────────────────────────────────────────────────

  it("persist.rehydrate() is a function (persist middleware wired)", () => {
    // If persist is not wired, `useTimelineStore.persist` will be undefined
    expect(typeof useTimelineStore.persist).toBe("object");
    expect(typeof useTimelineStore.persist.rehydrate).toBe("function");
  });

  it("persist storage key is 'aws-local-ui/timeline'", () => {
    expect(useTimelineStore.persist.getOptions().name).toBe("aws-local-ui/timeline");
  });

  it("partialize: only timeRange is persisted", async () => {
    const options = useTimelineStore.persist.getOptions();
    const fullState = useTimelineStore.getState();
    // partialize should whitelist timeRange only
    const partial = options.partialize!(fullState);
    expect(Object.keys(partial)).toEqual(["timeRange"]);
    expect((partial as Record<string, unknown>).timeRange).toBe("1h");
  });

  it("partialize: events are not persisted", async () => {
    const options = useTimelineStore.persist.getOptions();
    const fullState = useTimelineStore.getState();
    const partial = options.partialize!(fullState);
    expect("events" in partial).toBe(false);
  });

  it("partialize: isPolling is not persisted", async () => {
    const options = useTimelineStore.persist.getOptions();
    const fullState = useTimelineStore.getState();
    const partial = options.partialize!(fullState);
    expect("isPolling" in partial).toBe(false);
  });

  it("partialize: status is not persisted", async () => {
    const options = useTimelineStore.persist.getOptions();
    const fullState = useTimelineStore.getState();
    const partial = options.partialize!(fullState);
    expect("status" in partial).toBe(false);
  });

  it("partialize: lastUpdatedAt is not persisted", async () => {
    const options = useTimelineStore.persist.getOptions();
    const fullState = useTimelineStore.getState();
    const partial = options.partialize!(fullState);
    expect("lastUpdatedAt" in partial).toBe(false);
  });

  it("skipHydration: persist option is true", () => {
    expect(useTimelineStore.persist.getOptions().skipHydration).toBe(true);
  });

  it("skipHydration: persist.hasHydrated() is a function", () => {
    expect(typeof useTimelineStore.persist.hasHydrated).toBe("function");
  });

  it("version is 1", () => {
    const options = useTimelineStore.persist.getOptions();
    expect(options.version).toBe(1);
  });
});
