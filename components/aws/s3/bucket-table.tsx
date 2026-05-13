import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Bucket } from "@/types/aws";

type Props = {
  buckets: Bucket[];
};

export function BucketTable({ buckets }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {buckets.map((bucket) => (
          <TableRow key={bucket.name}>
            <TableCell>
              <Link
                href={`/s3/${bucket.name}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {bucket.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(bucket.createdAt).toLocaleString()}
            </TableCell>
            <TableCell>
              {/* BucketRowActions — wired in Slice 3 */}
              <div />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
