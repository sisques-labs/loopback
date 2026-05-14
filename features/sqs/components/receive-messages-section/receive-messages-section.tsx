"use client";

import { useActionState, useEffect, useState } from "react";
import { InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  receiveMessagesAction,
  type ReceiveMessagesSuccess,
  type SqsReceivedMessageBrief,
} from "@/features/sqs/use-cases/receive-messages/receive-messages";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

const INITIAL: ActionState<ReceiveMessagesSuccess> = { status: "idle" };

type Props = {
  queueUrl: string;
  dict: AppDict["sqs"]["queueDetail"]["receive"];
};

export function ReceiveMessagesSection({ queueUrl, dict }: Props) {
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
            <li
              key={`${m.messageId}-${i}-${m.receiptHandle ? m.receiptHandle.slice(0, 12) : "none"}`}
              className="rounded-md bg-muted/40 p-3"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {dict.messageIdLabel}: <span className="font-mono text-foreground">{m.messageId}</span>
              </p>
              <pre className="mt-2 max-h-40 overflow-auto wrap-break-word whitespace-pre-wrap font-mono text-xs">
                {m.body || "—"}
              </pre>
              {m.receiptHandle ? (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  receipt: <span className="font-mono">{m.receiptHandle.slice(0, 48)}…</span>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
