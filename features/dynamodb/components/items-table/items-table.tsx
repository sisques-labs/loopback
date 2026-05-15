import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

export type ItemsTableProps = {
  items: Record<string, unknown>[];
  partitionKeyName: string;
  sortKeyName?: string;
  tableDict: AppDict["dynamodb"]["table"];
  emptyMessage: string;
  nextPageLabel: string;
  nextKey: string | null;
  nextPageHref: string | null;
  renderRowActions: (item: Record<string, unknown>) => React.ReactNode;
};

function formatKeyValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ItemsTable({
  items,
  partitionKeyName,
  sortKeyName,
  tableDict,
  emptyMessage,
  nextPageLabel,
  nextKey,
  nextPageHref,
  renderRowActions,
}: ItemsTableProps) {
  if (items.length === 0) {
    return <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-0">{partitionKeyName}</TableHead>
            {sortKeyName && (
              <TableHead className="hidden sm:table-cell">{sortKeyName}</TableHead>
            )}
            <TableHead className="w-24">{tableDict.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-none">
                <span className="block truncate font-mono text-sm sm:overflow-visible sm:whitespace-normal">
                  {formatKeyValue(item[partitionKeyName])}
                </span>
              </TableCell>
              {sortKeyName && (
                <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                  {formatKeyValue(item[sortKeyName])}
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-1">{renderRowActions(item)}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {nextKey && nextPageHref && (
        <div className="flex justify-end">
          <Link href={nextPageHref}>
            <Button variant="outline" size="sm" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9">
              {nextPageLabel}
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
