"use client";

import { useEffect, useState } from "react";
import { useTimelineStore } from "@/features/timeline/stores/use-timeline-store/use-timeline-store";
import { useInvokeHistoryStore } from "@/features/lambda/stores/use-invoke-history-store/use-invoke-history-store";
import { useLogsStore } from "@/features/logs/stores/use-logs-store/use-logs-store";

// ── Module-scoped hydration promise ───────────────────────────────────────────
// Memoized across all consumers so stores are rehydrated exactly once,
// regardless of how many components on the page call useHydration().

let hydrationPromise: Promise<void> | null = null;

function rehydrateAll(): Promise<void> {
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = Promise.all([
    useTimelineStore.persist.rehydrate(),
    useInvokeHistoryStore.persist.rehydrate(),
    useLogsStore.persist.rehydrate(),
  ]).then(() => undefined);
  return hydrationPromise;
}

/** @internal — test-only: reset the memoized hydration promise between tests */
export function _resetHydrationPromise(): void {
  hydrationPromise = null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * `useHydration` — SSR-safe Zustand persist rehydration gate.
 *
 * Returns `{ isHydrated: boolean }`. On the server (and before the first
 * client effect fires) `isHydrated` is `false` — persisted values must NOT
 * be rendered yet to avoid React hydration mismatches.
 *
 * On client mount the hook triggers `persist.rehydrate()` on all three
 * persist-enabled stores (timeline, invoke-history, logs-filters). The
 * module-scoped `hydrationPromise` ensures rehydration happens once even
 * when multiple components on the same page call this hook.
 *
 * @example
 * ```tsx
 * "use client";
 * function TimelineToolbar() {
 *   const { isHydrated } = useHydration();
 *   const timeRange = useTimelineStore((s) => s.timeRange);
 *   if (!isHydrated) return <Skeleton className="h-9 w-32" />;
 *   return <TimeRangePill value={timeRange} />;
 * }
 * ```
 */
export function useHydration(): { isHydrated: boolean } {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    rehydrateAll().then(() => {
      if (mounted) setIsHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { isHydrated };
}
