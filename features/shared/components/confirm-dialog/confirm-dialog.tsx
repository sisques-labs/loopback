"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionState } from "@/types/aws";

type HiddenField = { name: string; value: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  hiddenFields?: HiddenField[];
  confirmLabel?: string;
};

const INITIAL_STATE: ActionState = { status: "idle" };

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  hiddenFields = [],
  confirmLabel = "Confirm",
}: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.status === "success") onOpenChange(false);
    if (state.status === "error") toast.error(state.message);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="hidden" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <form action={formAction}>
          {hiddenFields.map((f) => (
            <input key={f.name} type="hidden" name={f.name} value={f.value} />
          ))}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button variant="destructive" type="submit" disabled={pending}>
              {pending ? `${confirmLabel}…` : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
