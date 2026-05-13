"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontalIcon, DownloadIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteObjectAction } from "@/features/s3/actions/s3";
import type { ActionState } from "@/types/aws";

type Props = {
  bucket: string;
  objectKey: string;
};

const INITIAL_STATE: ActionState = { status: "idle" };

export function ObjectRowActions({ bucket, objectKey }: Props) {
  const [state, formAction, pending] = useActionState(deleteObjectAction, INITIAL_STATE);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
    }
    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="hidden" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete object</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-mono text-xs text-foreground">{objectKey}</span>? This action cannot be undone.
          </p>
          <form action={formAction}>
            <input type="hidden" name="bucket" value={bucket} />
            <input type="hidden" name="key" value={objectKey} />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>
                Cancel
              </DialogClose>
              <Button variant="destructive" type="submit" disabled={pending}>
                {pending ? "Deleting…" : "Delete"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
