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
};

export function BucketTable({ buckets, dict, localePrefix, rowActionsDict, confirmDict }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dict.name}</TableHead>
          <TableHead>{dict.created}</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {buckets.map((bucket) => (
          <TableRow key={bucket.name}>
            <TableCell>
              <Link
                href={`${localePrefix}/s3/${bucket.name}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {bucket.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(bucket.createdAt).toLocaleString()}
            </TableCell>
            <TableCell>
              <BucketRowActions
                bucket={bucket.name}
                dict={rowActionsDict}
                confirmDict={confirmDict}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
