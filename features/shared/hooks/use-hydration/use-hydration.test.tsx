/**
 * Tests for useHydration hook (PR1.7 RED → PR1.8 GREEN)
 *
 * Validates:
 *  - isHydrated is false on first render (before rehydrate resolves)
 *  - isHydrated flips to true after persist.rehydrate() resolves on all stores
 *  - rehydrate is called on all three stores when hook mounts
 */
import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";

// ── Use vi.hoisted so mocks are available in vi.mock factories ────────────────

const { mockTimelineRehydrate, mockInvokeHistoryRehydrate, mockLogsRehydrate } =
  vi.hoisted(() => ({
    mockTimelineRehydrate: vi.fn(),
    mockInvokeHistoryRehydrate: vi.fn(),
    mockLogsRehydrate: vi.fn(),
  }));

vi.mock(
  "@/features/timeline/stores/use-timeline-store/use-timeline-store",
  () => ({
    useTimelineStore: {
      persist: { rehydrate: mockTimelineRehydrate },
    },
  }),
);

vi.mock(
  "@/features/lambda/stores/use-invoke-history-store/use-invoke-history-store",
  () => ({
    useInvokeHistoryStore: {
      persist: { rehydrate: mockInvokeHistoryRehydrate },
    },
  }),
);

vi.mock("@/features/logs/stores/use-logs-store/use-logs-store", () => ({
  useLogsStore: {
    persist: { rehydrate: mockLogsRehydrate },
  },
}));

import { useHydration, _resetHydrationPromise } from "./use-hydration";

describe("useHydration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module-scoped hydrationPromise so each test starts clean
    _resetHydrationPromise();
  });

  afterEach(() => {
    cleanup();
  });

  it("returns { isHydrated: false } on first render before rehydrate resolves", () => {
    // rehydrate never resolves
    mockTimelineRehydrate.mockReturnValue(new Promise(() => {}));
    mockInvokeHistoryRehydrate.mockReturnValue(new Promise(() => {}));
    mockLogsRehydrate.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useHydration());
    // Synchronously check — must be false before any async work
    expect(result.current.isHydrated).toBe(false);
  });

  it("flips isHydrated to true after all store rehydrate() promises resolve", async () => {
    mockTimelineRehydrate.mockResolvedValue(undefined);
    mockInvokeHistoryRehydrate.mockResolvedValue(undefined);
    mockLogsRehydrate.mockResolvedValue(undefined);

    const { result } = renderHook(() => useHydration());

    // Initially false
    expect(result.current.isHydrated).toBe(false);

    // After the promises resolve, isHydrated should flip to true
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.isHydrated).toBe(true);
  });

  it("rehydrate is called on all three stores when hook mounts", async () => {
    mockTimelineRehydrate.mockResolvedValue(undefined);
    mockInvokeHistoryRehydrate.mockResolvedValue(undefined);
    mockLogsRehydrate.mockResolvedValue(undefined);

    renderHook(() => useHydration());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockTimelineRehydrate).toHaveBeenCalledTimes(1);
    expect(mockInvokeHistoryRehydrate).toHaveBeenCalledTimes(1);
    expect(mockLogsRehydrate).toHaveBeenCalledTimes(1);
  });
});
