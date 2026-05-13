import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { S3Object } from "@/types/aws";
import { UploadDialog } from "@/components/aws/s3/upload-dialog";
import { ObjectRowActions } from "@/components/aws/s3/object-row-actions";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

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
