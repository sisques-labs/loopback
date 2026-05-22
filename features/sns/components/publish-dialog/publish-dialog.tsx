"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { JsonTextarea } from "@/features/shared/components/json-textarea/json-textarea";
import { publishMessageAction } from "@/features/sns/use-cases/publish-message/publish-message";
import { t } from "@/features/shared/i18n/interpolate";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  topicArn: string;
  topicName: string;
  dict: AppDict["sns"]["publishDialog"];
  locale: Locale;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeLabel: string;
};

export function PublishDialog({ topicArn, topicName, dict, locale, open, onOpenChange, closeLabel}: Props) {
  const [state, formAction, pending] = useActionState(publishMessageAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const controlled = open !== undefined;
  const [messageError, setMessageError] = useState<string | null>(null);

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (messageError !== null) {
      e.preventDefault();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {controlled ? (
        <DialogTrigger className="hidden" />
      ) : (
        <DialogTrigger render={<Button size="sm" variant="outline" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9" />}>
          {dict.trigger}
        </DialogTrigger>
      )}
      <DialogContent closeLabel={closeLabel}>
        <DialogHeader>
          <DialogTitle>{t(dict.title, { topic: topicName })}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="topicArn" value={topicArn} />
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-col gap-1.5">
            <JsonTextarea
              name="message"
              label={dict.messageLabel}
              placeholder={dict.messagePlaceholder}
              required
              rows={4}
              onValidityChange={(valid) =>
                setMessageError(valid ? null : dict.invalidJson)
              }
            />
            {messageError !== null && (
              <p className="text-xs text-destructive">{messageError}</p>
            )}
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
            <Button type="submit" disabled={pending || messageError !== null}>
              {pending ? dict.submitting : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
