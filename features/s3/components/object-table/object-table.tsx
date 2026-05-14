import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ObjectRowActions } from "@/features/s3/components/object-row-actions/object-row-actions";
import { UploadDialog } from "@/features/s3/components/upload-dialog/upload-dialog";
import type { S3Object } from "@/features/s3/types/s3";
import { formatBytes } from "@/features/shared/utils/format-bytes/format-bytes";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  bucket: string;
  objects: S3Object[];
  dict: AppDict["s3"]["objectTable"];
  uploadDict: AppDict["s3"]["uploadDialog"];
  rowActionsDict: AppDict["s3"]["objectRowActions"];
  renameActionsDict: AppDict["s3"]["renameObjectDialog"];
  confirmDict: AppDict["shared"]["confirmDialog"];
};

export function ObjectTable({
  bucket,
  objects,
  dict,
  uploadDict,
  rowActionsDict,
  renameActionsDict,
  confirmDict,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="text-lg font-semibold">{dict.title}</h2>
        <UploadDialog bucket={bucket} dict={uploadDict} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-none">
              {dict.key}
            </TableHead>
            <TableHead>{dict.size}</TableHead>
            <TableHead className="hidden sm:table-cell">{dict.lastModified}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {objects.map((obj) => (
            <TableRow key={obj.key}>
              <TableCell className="max-w-[min(100%,12rem)] min-w-0 truncate font-mono text-xs sm:max-w-none">
                {obj.key}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatBytes(obj.size)}</TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {new Date(obj.lastModified).toLocaleString()}
              </TableCell>
              <TableCell>
                <ObjectRowActions
                  bucket={bucket}
                  objectKey={obj.key}
                  dict={rowActionsDict}
                  renameDict={renameActionsDict}
                  confirmDict={confirmDict}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
