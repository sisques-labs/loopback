import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { S3Object } from "@/types/aws";
import { UploadDialog } from "@/features/s3/components/upload-dialog/upload-dialog";
import { ObjectRowActions } from "@/features/s3/components/object-row-actions/object-row-actions";
import { formatBytes } from "@/features/shared/utils/format";

type Props = {
  bucket: string;
  objects: S3Object[];
};

export function ObjectTable({ bucket, objects }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Objects</h2>
        <UploadDialog bucket={bucket} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {objects.map((obj) => (
            <TableRow key={obj.key}>
              <TableCell className="font-mono text-xs">{obj.key}</TableCell>
              <TableCell className="text-muted-foreground">{formatBytes(obj.size)}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(obj.lastModified).toLocaleString()}
              </TableCell>
              <TableCell>
                <ObjectRowActions bucket={bucket} objectKey={obj.key} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
