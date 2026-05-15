"use client";

import { useActionState, useRef, useState } from "react";
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
import { invokeFunctionAction } from "@/features/lambda/use-cases/invoke-function/invoke-function";
import { t } from "@/features/shared/i18n/interpolate";
import type { ActionState } from "@/features/shared/types/action-state";
import type { InvokeResult } from "@/features/lambda/types/lambda";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

const INITIAL_STATE: ActionState<InvokeResult> = { status: "idle" };

type Props = {
  functionName: string;
  dict: AppDict["lambda"]["invokeDialog"];
  locale: Locale;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function InvokeDialog({ functionName, dict, locale, open, onOpenChange }: Props) {
  const [state, formAction, pending] = useActionState(invokeFunctionAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const controlled = open !== undefined;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const payload = (form.elements.namedItem("payload") as HTMLTextAreaElement)?.value ?? "";
    if (payload.trim() !== "") {
      try {
        JSON.parse(payload);
        setPayloadError(null);
      } catch {
        e.preventDefault();
        setPayloadError(dict.invalidPayload);
        return;
      }
    } else {
      setPayloadError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {controlled ? (
        <DialogTrigger className="hidden" />
      ) : (
        <DialogTrigger render={<Button size="sm" variant="outline" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9" />}>
          {dict.submit}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(dict.title, { functionName })}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="functionName" value={functionName} />
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invoke-payload">{dict.payloadLabel}</Label>
            <textarea
              id="invoke-payload"
              name="payload"
              placeholder={dict.payloadPlaceholder}
              rows={4}
              className="min-h-[96px] w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            {payloadError && (
              <p className="text-xs text-destructive">{payloadError}</p>
            )}
            {state.status === "error" && (
              <p className="text-xs text-destructive">{state.message}</p>
            )}
          </div>

          {state.status === "success" && (
            <div className="flex flex-col gap-3">
              {state.data.functionError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm font-semibold text-destructive">{dict.functionErrorTitle}</p>
                  <p className="mt-1 text-xs text-destructive/80">
                    {t(dict.functionErrorDetail, { functionError: state.data.functionError })}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">{dict.responseTitle}</p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{dict.statusCodeLabel}:</span>{" "}
                    {state.data.statusCode}
                  </p>
                  <p className="text-xs text-muted-foreground">{dict.bodyLabel}:</p>
                  <pre className="max-h-48 overflow-auto rounded-lg border bg-muted px-3 py-2 font-mono text-xs">
                    {state.data.body || "—"}
                  </pre>
                </div>
              </div>
            </div>
          )}

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
              {pending ? dict.invoking : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
