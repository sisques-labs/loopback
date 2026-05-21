import { Skeleton } from "@/components/ui/skeleton";

interface DetailSkeletonProps {
  rows?: number;
}

export function DetailSkeleton({ rows = 6 }: DetailSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton data-slot="skeleton-header" className="h-7 w-64" />
      <div className="rounded-lg border bg-card p-4">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            data-slot="skeleton-row"
            className="flex items-center gap-3 py-2"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
