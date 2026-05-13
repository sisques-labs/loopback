"use client";

import { useState } from "react";
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { deleteBucketAction } from "@/features/s3/use-cases/delete-bucket/delete-bucket";

type Props = {
  bucket: string;
};

export function BucketRowActions({ bucket }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Bucket actions" />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete bucket"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{bucket}</span>? This action cannot be undone.
          </>
        }
        action={deleteBucketAction}
        hiddenFields={[{ name: "bucket", value: bucket }]}
        confirmLabel="Delete"
      />
    </>
  );
}
