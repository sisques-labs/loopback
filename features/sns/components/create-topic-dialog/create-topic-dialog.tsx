"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTopicAction } from "@/features/sns/use-cases/create-topic/create-topic";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  dict: AppDict["sns"]["createTopicDialog"];
};

export function CreateTopicDialog({ dict }: Props) {
  const [state, formAction, pending] = useActionState(createTopicAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(dict.success);
      closeRef.current?.click();
    }
  }, [state, dict.success]);

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        {dict.trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topic-name">{dict.nameLabel}</Label>
            <Input
              id="topic-name"
              name="name"
              placeholder="my-topic"
              autoComplete="off"
              required
              aria-invalid={state.status === "error" ? true : undefined}
            />
            {state.status === "error" && (
              <p className="text-xs text-destructive">{state.message}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose ref={closeRef} render={<Button variant="outline" type="button" />}>
              {dict.cancel}
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? dict.creating : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
