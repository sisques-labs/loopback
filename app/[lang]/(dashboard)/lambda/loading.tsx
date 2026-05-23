import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/features/shared/components/table-skeleton/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-9 w-full sm:max-w-xs" />
      <TableSkeleton
        rows={5}
        columns={8}
        hideBelowSm={[1, 2, 6]}
        hideBelowMd={[3, 4, 5]}
      />
    </div>
  );
}
