"use client";

import { useState } from "react";
import { MoreHorizontalIcon, DownloadIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { deleteObjectAction } from "@/features/s3/use-cases/delete-object/delete-object";

type Props = {
  bucket: string;
  objectKey: string;
};

export function ObjectRowActions({ bucket, objectKey }: Props) {
  const [open, setOpen] = useState(false);
  const downloadHref = `/api/aws/s3/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(objectKey)}?download=1`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Object actions" />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => window.location.assign(downloadHref)}>
            <DownloadIcon />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete object"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-mono text-xs text-foreground">{objectKey}</span>? This action cannot be undone.
          </>
        }
        action={deleteObjectAction}
        hiddenFields={[
          { name: "bucket", value: bucket },
          { name: "key", value: objectKey },
        ]}
        confirmLabel="Delete"
      />
    </>
  );
}
