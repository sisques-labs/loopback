/**
 * Persistence tests for useLogsStore (PR1.5 RED → PR1.6 GREEN)
 *
 * Validates:
 *  - persist middleware is wired with storage key 'aws-local-ui/logs-filters'
 *  - partialize whitelist: only filters is written to storage
 *  - polling fields (entries, isPolling, status, lastUpdatedAt, autoScroll) are excluded
 */
import { describe, beforeEach, it, expect, vi } from "vitest";

// Mock the server action — must come before importing the store
vi.mock("@/features/logs/use-cases/get-log-events", () => ({
  getLogEventsAction: vi.fn().mockResolvedValue({ status: "idle" }),
}));

import { useLogsStore } from "./use-logs-store";

const INITIAL_STATE = {
  entries: [],
  isPolling: false,
  autoScroll: true,
  filters: { service: "", level: "all" as const, text: "" },
  status: "idle" as const,
  lastUpdatedAt: null,
};

describe("useLogsStore – persistence", () => {
  beforeEach(() => {
    useLogsStore.setState({ ...INITIAL_STATE });
  });

  // ── persist middleware wired ────────────────────────────────────────────────

  it("persist.rehydrate() is a function (persist middleware wired)", () => {
    expect(typeof useLogsStore.persist).toBe("object");
    expect(typeof useLogsStore.persist.rehydrate).toBe("function");
  });

  it("persist storage key is 'aws-local-ui/logs-filters'", () => {
    expect(useLogsStore.persist.getOptions().name).toBe("aws-local-ui/logs-filters");
  });

  it("version is 1", () => {
    expect(useLogsStore.persist.getOptions().version).toBe(1);
  });

  // ── partialize whitelist ──────────────────────────────────────────────────

  it("partialize: only filters is persisted", () => {
    const options = useLogsStore.persist.getOptions();
    const fullState = useLogsStore.getState();
    const partial = options.partialize!(fullState);
    expect(Object.keys(partial)).toEqual(["filters"]);
  });

  it("partialize: entries is not persisted", () => {
    const options = useLogsStore.persist.getOptions();
    const fullState = useLogsStore.getState();
    const partial = options.partialize!(fullState);
    expect("entries" in partial).toBe(false);
  });

  it("partialize: isPolling is not persisted", () => {
    const options = useLogsStore.persist.getOptions();
    const fullState = useLogsStore.getState();
    const partial = options.partialize!(fullState);
    expect("isPolling" in partial).toBe(false);
  });

  it("partialize: status is not persisted", () => {
    const options = useLogsStore.persist.getOptions();
    const fullState = useLogsStore.getState();
    const partial = options.partialize!(fullState);
    expect("status" in partial).toBe(false);
  });

  it("partialize: lastUpdatedAt is not persisted", () => {
    const options = useLogsStore.persist.getOptions();
    const fullState = useLogsStore.getState();
    const partial = options.partialize!(fullState);
    expect("lastUpdatedAt" in partial).toBe(false);
  });

  it("partialize: autoScroll is not persisted", () => {
    const options = useLogsStore.persist.getOptions();
    const fullState = useLogsStore.getState();
    const partial = options.partialize!(fullState);
    expect("autoScroll" in partial).toBe(false);
  });

  it("partialize captures the correct filters shape", () => {
    useLogsStore.setState({
      filters: { service: "lambda", level: "error", text: "timeout" },
    });
    const options = useLogsStore.persist.getOptions();
    const fullState = useLogsStore.getState();
    const partial = options.partialize!(fullState) as { filters: typeof INITIAL_STATE.filters };
    expect(partial.filters).toEqual({ service: "lambda", level: "error", text: "timeout" });
  });
});
