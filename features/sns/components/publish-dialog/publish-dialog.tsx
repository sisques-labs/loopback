"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
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
import { publishMessageAction } from "@/features/sns/use-cases/publish-message/publish-message";
import { t } from "@/features/shared/i18n/interpolate";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  topicArn: string;
  topicName: string;
  dict: AppDict["sns"]["publishDialog"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function PublishDialog({ topicArn, topicName, dict, open, onOpenChange }: Props) {
  const [state, formAction, pending] = useActionState(publishMessageAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const controlled = open !== undefined;

  useEffect(() => {
    if (state.status !== "success") return;
    toast.success(t(dict.successToast, { topic: topicName }));
    formRef.current?.reset();
    if (controlled) {
      onOpenChange?.(false);
    } else {
      closeRef.current?.click();
    }
  }, [state.status, dict.successToast, topicName, controlled, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {controlled ? (
        <DialogTrigger className="hidden" />
      ) : (
        <DialogTrigger render={<Button size="sm" variant="outline" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9" />}>
          {dict.trigger}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(dict.title, { topic: topicName })}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="topicArn" value={topicArn} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="publish-message">{dict.messageLabel}</Label>
            <textarea
              id="publish-message"
              name="message"
              placeholder={dict.messagePlaceholder}
              required
              rows={4}
              aria-required="true"
              className="min-h-[96px] w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
            />
            {state.status === "error" && (
              <p className="text-xs text-destructive">{state.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="publish-subject">{dict.subjectLabel}</Label>
            <Input
              id="publish-subject"
              name="subject"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            {!controlled && (
              <DialogClose ref={closeRef} render={<Button variant="outline" type="button" />}>
                {dict.cancel}
              </DialogClose>
            )}
            {controlled && (
              <Button variant="outline" type="button" onClick={() => onOpenChange?.(false)}>
                {dict.cancel}
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? dict.submitting : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
