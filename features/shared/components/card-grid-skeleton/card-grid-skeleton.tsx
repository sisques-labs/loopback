import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardGridSkeletonProps {
  items?: number;
  /** Number of columns at md+. Below md, always 1 col. */
  columns?: 2 | 3 | 4;
  className?: string;
}

const colGrid: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export function CardGridSkeleton({
  items = 6,
  columns = 3,
  className,
}: CardGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3", colGrid[columns], className)}>
      {Array.from({ length: items }, (_, i) => (
        <div
          key={i}
          data-slot="skeleton-card"
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}
