import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Bucket } from "@/features/s3/types/s3";
import { BucketRowActions } from "@/features/s3/components/bucket-row-actions/bucket-row-actions";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  buckets: Bucket[];
  dict: AppDict["s3"]["bucketTable"];
  localePrefix: string;
  rowActionsDict: AppDict["s3"]["bucketRowActions"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  closeLabel: string;
};

export function BucketTable({
  buckets,
  dict,
  localePrefix,
  rowActionsDict,
  confirmDict,
  closeLabel,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-0">{dict.name}</TableHead>
          <TableHead className="hidden sm:table-cell">{dict.created}</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {buckets.map((bucket) => (
          <TableRow key={bucket.name}>
            <TableCell className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-none">
              <Link
                href={`${localePrefix}/s3/${bucket.name}`}
                className="block truncate font-medium text-foreground underline-offset-4 hover:underline sm:overflow-visible sm:whitespace-normal"
              >
                {bucket.name}
              </Link>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {new Date(bucket.createdAt).toLocaleString()}
            </TableCell>
            <TableCell>
              <BucketRowActions
                bucket={bucket.name}
                dict={rowActionsDict}
                confirmDict={confirmDict}
                closeLabel={closeLabel}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
