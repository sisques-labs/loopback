"use client";

import { useActionState, useEffect, useState } from "react";
import { InfoIcon, InboxIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  receiveMessagesAction,
  type ReceiveMessagesSuccess,
  type SqsReceivedMessageBrief,
} from "@/features/sqs/use-cases/receive-messages/receive-messages";
import { requeueMessageAction } from "@/features/sqs/use-cases/requeue-message/requeue-message";
import { MessageAttributesDialog } from "@/features/sqs/components/message-attributes-dialog/message-attributes-dialog";
import { JsonViewer } from "@/features/shared/components/json-viewer/json-viewer";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

const INITIAL: ActionState<ReceiveMessagesSuccess> = { status: "idle" };
const INITIAL_REQUEUE_STATE: ActionState = { status: "idle" };

type MessageRowProps = {
  message: SqsReceivedMessageBrief;
  queueUrl: string;
  locale: Locale;
  dict: AppDict["sqs"]["queueDetail"]["receive"];
  copyButtonDict: AppDict["shared"]["copyButton"];
};

function MessageRow({ message, queueUrl, locale, dict, copyButtonDict }: MessageRowProps) {
  const [state, formAction, pending] = useActionState(requeueMessageAction, INITIAL_REQUEUE_STATE);
  const [attrsOpen, setAttrsOpen] = useState(false);

  const hasAttrs =
    (message.attributes && Object.keys(message.attributes).length > 0) ||
    (message.messageAttributes && Object.keys(message.messageAttributes).length > 0);

  return (
    <li
      className="rounded-md bg-muted/40 p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {dict.messageIdLabel}:{" "}
            <span className="font-mono text-foreground">{message.messageId}</span>
          </p>
          <div className="mt-2">
            <JsonViewer
              value={message.body ?? ""}
              maxHeight="10rem"
              copyLabel={copyButtonDict.copy}
              copiedLabel={copyButtonDict.copied}
            />
          </div>
          {message.receiptHandle ? (
            <p className="mt-2 text-[10px] text-muted-foreground">
              receipt:{" "}
              <span className="font-mono">{message.receiptHandle.slice(0, 48)}…</span>
            </p>
          ) : null}
          {state.status === "success" && (
            <p className="mt-1 text-xs text-green-600">{dict.requeue.requeueSuccess}</p>
          )}
          {state.status === "error" && (
            <p className="mt-1 text-xs text-destructive">{state.message}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {hasAttrs && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={dict.attributesDialog.trigger}
              aria-label={dict.attributesDialog.trigger}
              className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
              onClick={() => setAttrsOpen(true)}
            >
              <InfoIcon />
            </Button>
          )}
          <form action={formAction} className="shrink-0">
            <input type="hidden" name="queueUrl" value={queueUrl} />
            <input type="hidden" name="receiptHandle" value={message.receiptHandle} />
            <input type="hidden" name="locale" value={locale} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={pending}
              title={dict.requeue.requeue}
              aria-label={dict.requeue.requeue}
              className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
            >
              <RotateCcwIcon />
              <span className="sr-only">
                {pending ? dict.requeue.requeueing : dict.requeue.requeue}
              </span>
            </Button>
            {pending && (
              <span className="text-xs text-muted-foreground">{dict.requeue.requeueing}</span>
            )}
          </form>
        </div>
      </div>
      <MessageAttributesDialog
        open={attrsOpen}
        onClose={() => setAttrsOpen(false)}
        attributes={message.attributes}
        messageAttributes={message.messageAttributes}
        dict={dict.attributesDialog}
        closeLabel={dict.attributesDialog.close}
      />
    </li>
  );
}

type Props = {
  queueUrl: string;
  dict: AppDict["sqs"]["queueDetail"]["receive"];
  copyButtonDict: AppDict["shared"]["copyButton"];
  locale: Locale;
};

export function ReceiveMessagesSection({ queueUrl, dict, copyButtonDict, locale }: Props) {
  const [state, formAction, pending] = useActionState(receiveMessagesAction, INITIAL);
  const [lastBatch, setLastBatch] = useState<SqsReceivedMessageBrief[]>([]);

  useEffect(() => {
    if (state.status === "success" && state.data) {
      const msgs = state.data.messages;
      queueMicrotask(() => setLastBatch(msgs));
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">{dict.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{dict.description}</p>
        </div>
        <form action={formAction} className="shrink-0 pt-2 sm:pt-0">
          <input type="hidden" name="queueUrl" value={queueUrl} />
          <input type="hidden" name="locale" value={locale} />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={pending}
            className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
          >
            <InboxIcon />
            {pending ? dict.submitting : dict.trigger}
          </Button>
        </form>
      </div>
      {state.status === "error" && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}
      {lastBatch.length === 0 && state.status === "success" && (
        <p className="text-sm text-muted-foreground">{dict.empty}</p>
      )}
      {lastBatch.length > 0 && (
        <ul className="flex flex-col gap-3">
          {lastBatch.map((m, i) => (
            <MessageRow
              key={`${m.messageId}-${i}-${m.receiptHandle ? m.receiptHandle.slice(0, 12) : "none"}`}
              message={m}
              queueUrl={queueUrl}
              locale={locale}
              dict={dict}
              copyButtonDict={copyButtonDict}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
