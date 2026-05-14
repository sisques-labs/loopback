"use client";

import { useActionState, useEffect, useRef } from "react";
import { PlusIcon } from "lucide-react";
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
import { subscribeAction } from "@/features/sns/use-cases/subscribe/subscribe";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

const INITIAL_STATE: ActionState = { status: "idle" };

const ALL_PROTOCOLS = ["http", "https", "sqs", "email"] as const;

type Props = {
  topicArn: string;
  isFifo: boolean;
  dict: AppDict["sns"]["subscribeDialog"];
};

export function SubscribeDialog({ topicArn, isFifo, dict }: Props) {
  const [state, formAction, pending] = useActionState(subscribeAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);

  const protocols = isFifo ? (["sqs"] as const) : ALL_PROTOCOLS;

  useEffect(() => {
    if (state.status === "success") {
      closeRef.current?.click();
    }
  }, [state.status]);

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
          <input type="hidden" name="topicArn" value={topicArn} />
          <input type="hidden" name="isFifo" value={String(isFifo)} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subscribe-protocol">{dict.protocolLabel}</Label>
            <select
              id="subscribe-protocol"
              name="protocol"
              defaultValue={isFifo ? "sqs" : "http"}
              className="min-h-11 rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 md:h-8 md:min-h-8"
            >
              {protocols.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {isFifo && (
              <p className="text-xs text-muted-foreground">{dict.fifoHint}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subscribe-endpoint">{dict.endpointLabel}</Label>
            <Input
              id="subscribe-endpoint"
              name="endpoint"
              placeholder={dict.endpointPlaceholder}
              autoComplete="off"
              required
              aria-invalid={state.status === "error" ? true : undefined}
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
