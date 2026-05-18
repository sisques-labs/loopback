"use client";

import { useLogsStore } from "@/features/shared/stores/use-logs-store";
import type { LogsDict } from "@/features/logs/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ────────────────────────────────────────────────────────────────────

type LogSearchDict = Pick<WidenStringLiterals<LogsDict>, "search">;

type LogSearchProps = {
  dict: LogSearchDict;
};

// ── Component ────────────────────────────────────────────────────────────────

export function LogSearch({ dict }: LogSearchProps) {
  const { filters, setFilter } = useLogsStore();

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border">
      <label className="sr-only" htmlFor="log-search">
        {dict.search.label}
      </label>
      <input
        id="log-search"
        type="text"
        role="textbox"
        value={filters.text}
        onChange={(e) => setFilter("text", e.target.value)}
        placeholder={dict.search.placeholder}
        className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground"
      />
    </div>
  );
}
