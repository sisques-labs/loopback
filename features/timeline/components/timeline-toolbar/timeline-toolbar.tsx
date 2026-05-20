import { cn } from "@/lib/utils";
import { formatElapsed } from "@/features/shared/utils/format-elapsed/format-elapsed";
import type { TimelineTimeRange, TimelineStoreStatus } from "../../lib/types/types";

// ── Types ──────────────────────────────────────────────────────────────────────

type TimelineToolbarDict = {
  toolbar: {
    timeRange: {
      label: string;
      "1h": string;
      "6h": string;
      "24h": string;
      all: string;
    };
    statusPolling: string;
    statusError: string;
    statusIdle: string;
    lastUpdated: string;
  };
};

type TimelineToolbarProps = {
  dict: TimelineToolbarDict;
  status: TimelineStoreStatus;
  lastUpdatedAt: number | null;
  timeRange: TimelineTimeRange;
  onTimeRangeChange: (range: TimelineTimeRange) => void;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const TIME_RANGES: TimelineTimeRange[] = ["1h", "6h", "24h", "all"];

// ── Component ──────────────────────────────────────────────────────────────────

export function TimelineToolbar({
  dict,
  status,
  lastUpdatedAt,
  timeRange,
  onTimeRangeChange,
}: TimelineToolbarProps) {
  const statusText =
    status === "polling"
      ? dict.toolbar.statusPolling
      : status === "error"
        ? dict.toolbar.statusError
        : dict.toolbar.statusIdle;

  const statusColor =
    status === "polling"
      ? "text-green-600 dark:text-green-400"
      : status === "error"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      {/* Time range selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="timeline-time-range"
          className="text-sm text-muted-foreground shrink-0"
        >
          {dict.toolbar.timeRange.label}
        </label>
        <div className="min-h-11 flex items-center">
          <select
            id="timeline-time-range"
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as TimelineTimeRange)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {TIME_RANGES.map((range) => (
              <option key={range} value={range}>
                {dict.toolbar.timeRange[range]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className={cn("font-medium", statusColor)}>{statusText}</span>
        {lastUpdatedAt !== null && (
          <span className="text-muted-foreground">
            &middot;{" "}
            {dict.toolbar.lastUpdated.replace("{time}", formatElapsed(lastUpdatedAt))}
          </span>
        )}
      </div>
    </div>
  );
}
