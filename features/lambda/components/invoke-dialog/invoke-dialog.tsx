"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { JsonTextarea } from "@/features/shared/components/json-textarea/json-textarea";
import { JsonViewer } from "@/features/shared/components/json-viewer/json-viewer";
import { invokeFunctionAction } from "@/features/lambda/use-cases/invoke-function/invoke-function";
import { t } from "@/features/shared/i18n/interpolate";
import type { ActionState } from "@/features/shared/types/action-state";
import type { InvokeResult } from "@/features/lambda/types/lambda";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import { useInvokeHistoryStore } from "@/features/lambda/stores/use-invoke-history-store/use-invoke-history-store";
import { InvokeLogTail } from "@/features/lambda/components/invoke-log-tail/invoke-log-tail";

const INITIAL_STATE: ActionState<InvokeResult> = { status: "idle" };

type Props = {
  functionName: string;
  dict: AppDict["lambda"]["invokeDialog"];
  logTailDict?: AppDict["lambda"]["invokeLogTail"];
  copyButtonDict: AppDict["shared"]["copyButton"];
  locale: Locale;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeLabel: string;
};

async function computePayloadHash(payloadString: string): Promise<string> {
  if (!payloadString) return "00000000";
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex.slice(0, 8);
}

export function InvokeDialog({ functionName, dict, logTailDict, copyButtonDict, locale, open, onOpenChange, closeLabel }: Props) {
  const [state, formAction, pending] = useActionState(invokeFunctionAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const controlled = open !== undefined;

  // Track the payload string at submit time so we can hash it when action settles
  const payloadAtSubmitRef = useRef<string>("");
  // Track whether we've already dispatched to the store for the current success state
  const dispatchedRef = useRef(false);
  // Timestamp captured at submit time (epoch ms); initialized to mount time so it's always valid
  const [submitTimestamp, setSubmitTimestamp] = useState<number>(() => Date.now());

  const addEntry = useInvokeHistoryStore.getState().addEntry;

  // Dispatch to history store when the action settles with success
  useEffect(() => {
    if (state.status !== "success") {
      dispatchedRef.current = false;
      return;
    }
    if (dispatchedRef.current) return;
    dispatchedRef.current = true;

    const startTime = Date.now();
    const payloadString = payloadAtSubmitRef.current;

    computePayloadHash(payloadString).then((payloadHash) => {
      addEntry({
        id: crypto.randomUUID(),
        functionName,
        payloadHash,
        statusCode: state.data.statusCode,
        duration: Date.now() - startTime,
        timestamp: new Date(startTime).toISOString(),
        functionError: state.data.functionError,
      });
    });
  }, [state, functionName, addEntry]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (payloadError !== null) {
      e.preventDefault();
      return;
    }
    const form = e.currentTarget;
    const payload = (form.elements.namedItem("payload") as HTMLTextAreaElement)?.value ?? "";
    payloadAtSubmitRef.current = payload;
    dispatchedRef.current = false;
    setSubmitTimestamp(Date.now());
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
      <DialogContent closeLabel={closeLabel}>
        <DialogHeader>
          <DialogTitle>{t(dict.title, { functionName })}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="functionName" value={functionName} />
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-col gap-1.5">
            <JsonTextarea
              name="payload"
              label={dict.payloadLabel}
              placeholder={dict.payloadPlaceholder}
              rows={6}
              onValidityChange={(valid) =>
                setPayloadError(valid ? null : dict.invalidPayload)
              }
            />
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
                  <JsonViewer
                    value={state.data.body ?? ""}
                    copyLabel={copyButtonDict.copyJson}
                    copiedLabel={copyButtonDict.copyJsonCopied}
                  />
                </div>
              </div>
            </div>
          )}

          {state.status === "success" && logTailDict && (
            <InvokeLogTail
              functionName={functionName}
              invokeTimestamp={submitTimestamp}
              dict={logTailDict}
            />
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
