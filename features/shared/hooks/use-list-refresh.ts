import { useEffect, useRef, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_INTERVAL_MS = 5000;

// ── Types ──────────────────────────────────────────────────────────────────

export type UseListRefreshOptions<T> = {
  intervalMs?: number;
  initialItems?: T[];
};

export type UseListRefreshResult<T> = {
  items: T[];
  isRefreshing: boolean;
  lastUpdatedAt: Date | null;
};

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * Generic polling hook for list pages.
 *
 * - Uses `useRef` for the timer (NOT module-level vars) so each mounted instance
 *   is fully isolated — HMR-safe and multi-mount-safe.
 * - Pauses polling when the document is hidden (Page Visibility API) and
 *   resumes with an immediate refresh when the document becomes visible again.
 * - All `document` access is guarded with `typeof document !== "undefined"` for SSR safety.
 * - Full cleanup on unmount: clears interval + removes event listener.
 */
export function useListRefresh<T>(
  action: () => Promise<T[]>,
  options?: UseListRefreshOptions<T>
): UseListRefreshResult<T> {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const initialItems = options?.initialItems ?? [];

  const [items, setItems] = useState<T[]>(initialItems);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // Instance-local timer ref — NOT a module-level variable
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable ref to action so we can use it inside effects without re-running them
  const actionRef = useRef(action);

  useEffect(() => {
    actionRef.current = action;
  });

  useEffect(() => {
    // ── Helpers ───────────────────────────────────────────────────────────

    async function refresh(): Promise<void> {
      setIsRefreshing(true);
      try {
        const result = await actionRef.current();
        setItems(result);
        setLastUpdatedAt(new Date());
      } finally {
        setIsRefreshing(false);
      }
    }

    function startInterval(): void {
      timerRef.current = setInterval(() => {
        void refresh();
      }, intervalMs);
    }

    function stopInterval(): void {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // ── Page Visibility handler ────────────────────────────────────────────

    function handleVisibilityChange(): void {
      if (typeof document === "undefined") return;

      if (document.hidden) {
        stopInterval();
      } else {
        // Resume: immediate refresh, then restart interval
        void refresh();
        startInterval();
      }
    }

    // ── Mount: start polling ───────────────────────────────────────────────

    startInterval();

    // ── Register Page Visibility listener (SSR-guarded) ───────────────────

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // ── Cleanup on unmount ────────────────────────────────────────────────

    return () => {
      stopInterval();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [intervalMs]);

  return { items, isRefreshing, lastUpdatedAt };
}
