// ── Types ──────────────────────────────────────────────────────────────────────

type InspectorSkeletonProps = {
  withSpine?: boolean;
  count?: number;
};

// ── Component ─────────────────────────────────────────────────────────────────

const DEFAULT_COUNT = 5;

export function InspectorSkeleton({
  withSpine = false,
  count = DEFAULT_COUNT,
}: InspectorSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div className="flex flex-col gap-2 p-3">
      {items.map((_, idx) => (
        <div
          key={idx}
          className={withSpine ? "flex gap-3" : undefined}
        >
          {withSpine && (
            <div className="flex flex-col items-center">
              <div
                data-testid="spine-dot"
                className="mt-1 h-3 w-3 shrink-0 rounded-full bg-muted animate-pulse"
              />
              {idx < count - 1 && <div className="w-px flex-1 bg-border" />}
            </div>
          )}
          <div
            data-testid="skeleton-item"
            className="flex-1 h-14 rounded-lg bg-muted animate-pulse"
          />
        </div>
      ))}
    </div>
  );
}
