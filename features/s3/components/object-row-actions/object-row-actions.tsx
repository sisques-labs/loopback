"use client";

import { useState } from "react";
import { MoreHorizontalIcon, DownloadIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { RenameObjectDialog } from "@/features/s3/components/rename-object-dialog/rename-object-dialog";
import { ObjectPreviewDialog } from "@/features/s3/components/object-preview-dialog/object-preview-dialog";
import { deleteObjectAction } from "@/features/s3/use-cases/delete-object/delete-object";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import { t } from "@/features/shared/i18n/interpolate";

type Props = {
  bucket: string;
  objectKey: string;
  dict: AppDict["s3"]["objectRowActions"];
  renameDict: AppDict["s3"]["renameObjectDialog"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  previewDict: AppDict["s3"]["previewDialog"];
  closeLabel: string;
};

export function ObjectRowActions({
  bucket,
  objectKey,
  dict,
  renameDict,
  confirmDict,
  previewDict,
  closeLabel,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const downloadHref = `/api/aws/s3/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(objectKey)}?download=1`;

  const previewObject = { key: objectKey, size: 0, lastModified: "" };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0 md:min-h-9 md:min-w-9"
              aria-label={dict.actions}
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPreviewOpen(true)}>
            <EyeIcon />
            {dict.preview}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.assign(downloadHref)}>
            <DownloadIcon />
            {dict.download}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            <PencilIcon />
            {dict.rename}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2Icon />
            {dict.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ObjectPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        object={previewObject}
        bucket={bucket}
        dict={previewDict}
        closeLabel={closeLabel}
      />

      <RenameObjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        bucket={bucket}
        objectKey={objectKey}
        dict={renameDict}
        closeLabel={closeLabel}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={dict.deleteTitle}
        description={t(dict.deleteConfirm, { key: objectKey })}
        action={deleteObjectAction}
        hiddenFields={[
          { name: "bucket", value: bucket },
          { name: "key", value: objectKey },
        ]}
        confirmLabel={dict.delete}
        cancelLabel={confirmDict.cancel}
        closeLabel={closeLabel}
        confirmingTemplate={confirmDict.confirming}
      />
    </>
  );
}
