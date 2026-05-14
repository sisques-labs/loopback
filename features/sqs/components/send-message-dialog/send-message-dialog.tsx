"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SendIcon } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { sendMessageAction } from "@/features/sqs/use-cases/send-message/send-message";
import { t } from "@/features/shared/i18n/interpolate";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  queueUrl: string;
  queueName: string;
  isFifo: boolean;
  dict: AppDict["sqs"]["queueDetail"]["sendMessage"];
};

export function SendMessageDialog({ queueUrl, queueName, isFifo, dict }: Props) {
  const [state, formAction, pending] = useActionState(sendMessageAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== "success") return;
    toast.success(t(dict.successToast, { queue: queueName }));
    formRef.current?.reset();
    closeRef.current?.click();
  }, [state.status, dict.successToast, queueName]);

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9" />}>
        <SendIcon />
        {dict.trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(dict.title, { queue: queueName })}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="queueUrl" value={queueUrl} />
          <input type="hidden" name="isFifo" value={String(isFifo)} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sqs-send-body">{dict.bodyLabel}</Label>
            <textarea
              id="sqs-send-body"
              name="body"
              placeholder={dict.bodyPlaceholder}
              required
              rows={4}
              aria-required="true"
              className="min-h-[96px] w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
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
              {pending ? dict.submitting : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
