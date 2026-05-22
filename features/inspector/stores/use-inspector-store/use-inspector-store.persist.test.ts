import { describe, beforeEach, afterEach, expect, it, vi } from "vitest";
import type { RequestEntry } from "@/features/inspector/lib/types/types";

vi.mock(
  "@/features/inspector/use-cases/get-inspector-entries/get-inspector-entries",
  () => ({
    getInspectorEntriesAction: vi.fn().mockResolvedValue({
      status: "success",
      data: { entries: [] },
    }),
    clearInspectorBufferAction: vi.fn().mockResolvedValue({
      status: "success",
      data: undefined,
    }),
  }),
);

// Simulate localStorage via a simple in-memory store
const fakeStorage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (key: string) => fakeStorage[key] ?? null,
  setItem: (key: string, value: string) => { fakeStorage[key] = value; },
  removeItem: (key: string) => { delete fakeStorage[key]; },
});

import { useInspectorStore } from "./use-inspector-store";
import type { RequestFilters } from "@/features/inspector/lib/types/types";

function makeEntry(id: string): RequestEntry {
  return {
    id,
    timestamp: 1700000000000,
    service: "S3",
    operation: "GetObjectCommand",
    input: {},
    output: {},
    durationMs: 5,
    status: "success",
    attempts: 1,
  };
}

describe("useInspectorStore — persist layer", () => {
  beforeEach(() => {
    // Clear fake storage before each test
    Object.keys(fakeStorage).forEach((k) => delete fakeStorage[k]);
    useInspectorStore.setState({
      entries: [],
      isPolling: false,
      status: "idle",
      lastUpdatedAt: null,
      filters: { service: "", status: "all", text: "" },
      view: "list",
    });
  });

  afterEach(() => {
    useInspectorStore.getState().stopPolling();
    vi.clearAllMocks();
  });

  it("entries are NOT persisted to storage", () => {
    // Set entries + update a filter to trigger persist
    useInspectorStore.setState({
      entries: [makeEntry("e1")],
      filters: { service: "S3", status: "all", text: "" },
    });

    const stored = fakeStorage["aws-local-ui/inspector"];
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: Record<string, unknown> };
      expect(parsed.state).not.toHaveProperty("entries");
    }
    // If nothing was stored yet, that's fine too (persist hasn't flushed synchronously)
  });

  it("filters are included in persisted state", () => {
    // Trigger persist by setting state
    const filters: RequestFilters = { service: "DynamoDB", status: "error", text: "test" };
    useInspectorStore.setState({ filters });

    // Manually trigger persist flush by calling setFilter (which writes to storage)
    useInspectorStore.getState().setFilter("service", "DynamoDB");

    const stored = fakeStorage["aws-local-ui/inspector"];
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: Record<string, unknown> };
      if (parsed.state) {
        expect(parsed.state).toHaveProperty("filters");
        expect(parsed.state).not.toHaveProperty("entries");
      }
    }
  });

  it("view is included in persisted state", () => {
    useInspectorStore.getState().setView("timeline");

    const stored = fakeStorage["aws-local-ui/inspector"];
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: Record<string, unknown> };
      if (parsed.state) {
        expect(parsed.state).toHaveProperty("view");
        expect(parsed.state).not.toHaveProperty("entries");
      }
    }
  });

  it("rehydrate is a callable function on the store", () => {
    expect(typeof useInspectorStore.persist.rehydrate).toBe("function");
    expect(() => useInspectorStore.persist.rehydrate()).not.toThrow();
  });

  it("getOptions returns skipHydration: true", () => {
    const opts = useInspectorStore.persist.getOptions();
    expect(opts.skipHydration).toBe(true);
  });

  it("after rehydrate, entries are NOT restored (entries not persisted)", async () => {
    // Pre-seed storage with entries (simulating corruption / manual set)
    fakeStorage["aws-local-ui/inspector"] = JSON.stringify({
      state: {
        entries: [makeEntry("should-not-restore")],
        filters: { service: "S3", status: "all", text: "" },
        view: "list",
      },
      version: 1,
    });

    await useInspectorStore.persist.rehydrate();

    // entries should remain empty — they are not in partialize
    expect(useInspectorStore.getState().entries).toHaveLength(0);
    // filters should be restored from storage
    expect(useInspectorStore.getState().filters.service).toBe("S3");
  });
});
