import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/features/shared/utils/format-timestamp/format-timestamp";
import { formatElapsed } from "@/features/shared/utils/format-elapsed/format-elapsed";
import { getServiceColorClasses } from "../../lib/service-color/service-color";
import type { TimelineEvent, TimelineEventLevel } from "../../lib/types/types";

// ── Types ──────────────────────────────────────────────────────────────────────

type TimelineCardProps = {
  event: TimelineEvent;
};

// ── Level styles ───────────────────────────────────────────────────────────────

const levelBorderStyles: Record<NonNullable<TimelineEventLevel>, string> = {
  info: "border-border",
  warn: "border-yellow-400",
  error: "border-destructive",
  unknown: "border-border",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function TimelineCard({ event }: TimelineCardProps) {
  const { eventId, timestamp, message, level = "unknown", service } = event;
  const colorClasses = getServiceColorClasses(service);
  const resolvedLevel = level ?? "unknown";
  const borderStyle = levelBorderStyles[resolvedLevel];

  return (
    <div className="flex gap-3" data-event-id={eventId} data-level={resolvedLevel}>
      {/* Spine node */}
      <div className="flex flex-col items-center">
        <div
          data-spine-node
          className={cn(
            "mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-background",
            colorClasses.spine
          )}
        />
        <div className="w-px flex-1 bg-border" />
      </div>

      {/* Card body */}
      <div
        className={cn(
          "mb-3 flex-1 rounded-lg border bg-card p-3 shadow-sm",
          borderStyle
        )}
      >
        {/* Header row: service badge + timestamp */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span
            data-service-badge
            className={cn(
              "inline-flex w-fit items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              colorClasses.badge
            )}
          >
            {service}
          </span>

          <span
            data-testid="timeline-card-timestamp"
            className="text-xs text-muted-foreground"
            title={new Date(timestamp).toISOString()}
          >
            {formatElapsed(timestamp)} ago &middot; {formatTimestamp(timestamp)}
          </span>
        </div>

        {/* Message */}
        <p className="mt-2 text-sm break-words">{message}</p>
      </div>
    </div>
  );
}
