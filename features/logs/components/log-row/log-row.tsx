import { cn } from "@/lib/utils";
import type { LogEntry, LogLevel } from "@/features/logs/lib/types/types";
import { formatTimestamp } from "@/features/shared/utils/format-timestamp/format-timestamp";
import type { LogsDict } from "@/features/logs/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ────────────────────────────────────────────────────────────────────

type LogRowDict = Pick<WidenStringLiterals<LogsDict>, "entry">;

type LogRowProps = {
  entry: LogEntry;
  dict: LogRowDict;
};

// ── Badge helpers ────────────────────────────────────────────────────────────

const levelStyles: Record<LogLevel, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  warn: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  unknown: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// ── Component ────────────────────────────────────────────────────────────────

export function LogRow({ entry, dict }: LogRowProps) {
  const { level, timestamp, message } = entry;
  const badgeLabel = dict.entry.level[level];

  return (
    <tr className="border-b border-border/40 font-mono text-xs leading-relaxed hover:bg-muted/30">
      <td className="w-28 shrink-0 px-3 py-1 text-muted-foreground whitespace-nowrap">
        {formatTimestamp(timestamp)}
      </td>
      <td className="w-20 shrink-0 px-2 py-1">
        <span
          data-level={level}
          className={cn(
            "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            levelStyles[level]
          )}
        >
          {badgeLabel}
        </span>
      </td>
      <td className="px-3 py-1 break-all">{message}</td>
    </tr>
  );
}
