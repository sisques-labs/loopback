import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  /** Column indices to hide below `sm` breakpoint. */
  hideBelowSm?: number[];
  /** Column indices to hide below `md` breakpoint. */
  hideBelowMd?: number[];
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  hideBelowSm = [],
  hideBelowMd = [],
}: TableSkeletonProps) {
  const colClass = (i: number) =>
    hideBelowMd.includes(i)
      ? "hidden md:table-cell"
      : hideBelowSm.includes(i)
        ? "hidden sm:table-cell"
        : "";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }, (_, i) => (
            <TableHead key={i} className={colClass(i)}>
              <Skeleton className="h-4 w-20" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }, (_, r) => (
          <TableRow key={r}>
            {Array.from({ length: columns }, (_, c) => (
              <TableCell key={c} className={colClass(c)}>
                <Skeleton className="h-4 w-[80%]" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
