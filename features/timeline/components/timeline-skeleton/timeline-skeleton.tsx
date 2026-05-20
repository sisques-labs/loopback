// ── Types ──────────────────────────────────────────────────────────────────────

type TimelineSkeletonProps = {
  count?: number;
};

// ── Component ──────────────────────────────────────────────────────────────────

export function TimelineSkeleton({ count = 5 }: TimelineSkeletonProps) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} data-skeleton-item className="flex gap-3 pb-3">
          {/* Spine node placeholder */}
          <div className="flex flex-col items-center">
            <div className="mt-1 h-3 w-3 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="w-px flex-1 bg-border" />
          </div>

          {/* Card placeholder */}
          <div className="mb-3 flex-1 animate-pulse rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
