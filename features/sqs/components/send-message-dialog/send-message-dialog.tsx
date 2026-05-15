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
import { Textarea } from "@/components/ui/textarea";
import { sendMessageAction } from "@/features/sqs/use-cases/send-message/send-message";
import { t } from "@/features/shared/i18n/interpolate";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  queueUrl: string;
  queueName: string;
  isFifo: boolean;
  dict: AppDict["sqs"]["queueDetail"]["sendMessage"];
  locale: Locale;

    closeLabel: string;
};

export function SendMessageDialog({ queueUrl, queueName, isFifo, dict, locale, closeLabel}: Props) {
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
      <DialogContent closeLabel={closeLabel}>
        <DialogHeader>
          <DialogTitle>{t(dict.title, { queue: queueName })}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="queueUrl" value={queueUrl} />
          <input type="hidden" name="isFifo" value={String(isFifo)} />
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sqs-send-body">{dict.bodyLabel}</Label>
            <Textarea
              id="sqs-send-body"
              name="body"
              placeholder={dict.bodyPlaceholder}
              required
              aria-required="true"
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
