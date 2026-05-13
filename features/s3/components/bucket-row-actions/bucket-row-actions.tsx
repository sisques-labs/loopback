"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteBucketAction } from "@/features/s3/actions/delete-bucket";
import type { ActionState } from "@/types/aws";

type Props = {
  bucket: string;
};

const INITIAL_STATE: ActionState = { status: "idle" };

export function BucketRowActions({ bucket }: Props) {
  const [state, formAction, pending] = useActionState(deleteBucketAction, INITIAL_STATE);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
    }
    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Bucket actions" />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setOpen(true)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="hidden" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete bucket</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{bucket}</span>? This action cannot be undone.
          </p>
          <form action={formAction}>
            <input type="hidden" name="bucket" value={bucket} />
            <DialogFooter>
              <DialogClose ref={closeRef} render={<Button variant="outline" type="button" />}>
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
