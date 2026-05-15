"use client";

import { useActionState, useEffect, useState } from "react";
import { EraserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { purgeQueueAction } from "@/features/sqs/use-cases/purge-queue/purge-queue";
import { t } from "@/features/shared/i18n/interpolate";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

const INITIAL: ActionState = { status: "idle" };

type Props = {
  queueUrl: string;
  queueName: string;
  dict: AppDict["sqs"]["queueDetail"]["purge"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  locale: Locale;

    closeLabel: string;
};

export function PurgeQueueDialog({ queueUrl, queueName, dict, confirmDict, locale, closeLabel}: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(purgeQueueAction, INITIAL);

  useEffect(() => {
    if (state.status === "success") {
      queueMicrotask(() => setOpen(false));
    }
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10 md:min-h-9"
        onClick={() => setOpen(true)}
      >
        <EraserIcon />
        {dict.trigger}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent closeLabel={closeLabel}>
          <DialogHeader>
            <DialogTitle>{dict.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t(dict.description, { queue: queueName })}</p>
          <form action={formAction}>
            <input type="hidden" name="queueUrl" value={queueUrl} />
            <input type="hidden" name="locale" value={locale} />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>
                {confirmDict.cancel}
              </DialogClose>
              <Button variant="destructive" type="submit" disabled={pending}>
                {pending ? t(confirmDict.confirming, { confirmLabel: dict.confirmLabel }) : dict.confirmLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
