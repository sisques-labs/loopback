import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/features/shared/components/table-skeleton/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-9 w-full sm:max-w-xs" />
      <TableSkeleton rows={5} columns={4} hideBelowSm={[2]} hideBelowMd={[1]} />
    </div>
  );
}
