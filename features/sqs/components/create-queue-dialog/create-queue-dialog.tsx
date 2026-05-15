"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createQueueAction } from "@/features/sqs/use-cases/create-queue/create-queue";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  dict: AppDict["sqs"]["createQueueDialog"];
  locale: Locale;
};

export function CreateQueueDialog({ dict, locale }: Props) {
  const [state, formAction, pending] = useActionState(createQueueAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [isFifo, setIsFifo] = useState(false);

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
            <Label htmlFor="queue-name">{dict.nameLabel}</Label>
            <Input
              id="queue-name"
              name="name"
              placeholder={isFifo ? dict.nameFifoPlaceholder : "my-queue"}
              autoComplete="off"
              required
              aria-invalid={state.status === "error" ? true : undefined}
            />
            {isFifo && (
              <p className="text-xs text-muted-foreground">{dict.fifoHint}</p>
            )}
            {state.status === "error" && (
              <p className="text-xs text-destructive">{state.message}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="queue-fifo"
              checked={isFifo}
              onCheckedChange={(checked) => setIsFifo(checked === true)}
            />
            <Label htmlFor="queue-fifo">{dict.fifoLabel}</Label>
          </div>
          <input type="hidden" name="isFifo" value={String(isFifo)} />
          <input type="hidden" name="locale" value={locale} />
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
