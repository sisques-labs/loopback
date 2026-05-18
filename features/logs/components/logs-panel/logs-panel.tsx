"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLogsStore } from "@/features/shared/stores/use-logs-store";
import { buildCriteria } from "@/features/logs/lib/build-criteria/build-criteria";
import { LogRow } from "@/features/logs/components/log-row/log-row";
import { cn } from "@/lib/utils";
import type { LogsDict } from "@/features/logs/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Constants ────────────────────────────────────────────────────────────────

const SCROLL_BOTTOM_THRESHOLD_PX = 50;

// ── Types ────────────────────────────────────────────────────────────────────

type LogsPanelDict = Pick<WidenStringLiterals<LogsDict>, "entry" | "autoScroll" | "empty" | "noMatch">;

type LogsPanelProps = {
  dict: LogsPanelDict;
};

// ── Component ────────────────────────────────────────────────────────────────

export function LogsPanel({ dict }: LogsPanelProps) {
  const { entries, filters, autoScroll, toggleAutoScroll, setAutoScroll } = useLogsStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Apply criteria filter
  const criteria = buildCriteria(filters);
  const filtered = entries.filter((e) => criteria.matches(e));

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (autoScroll && sentinelRef.current) {
      sentinelRef.current.scrollIntoView({ block: "end" });
    }
  }, [entries, autoScroll]);

  // Detect scroll-up and suspend auto-scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const isAtBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_BOTTOM_THRESHOLD_PX;
      if (!isAtBottom) {
        setAutoScroll(false);
      }
    },
    [setAutoScroll],
  );

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20">
        <button
          type="button"
          onClick={toggleAutoScroll}
          className={cn(
            "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
            autoScroll
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {dict.autoScroll.enable}
        </button>
      </div>

      {/* Log list */}
      <div
        className="flex-1 overflow-y-auto"
        data-testid="scroll-container"
        onScroll={handleScroll}
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
            {entries.length > 0 ? dict.noMatch : dict.empty}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {filtered.map((entry) => (
                <LogRow key={entry.id} entry={entry} dict={dict} />
              ))}
            </tbody>
          </table>
        )}

        {/* Bottom sentinel for auto-scroll */}
        <div ref={sentinelRef} data-testid="scroll-sentinel" />
      </div>
    </div>
  );
}
