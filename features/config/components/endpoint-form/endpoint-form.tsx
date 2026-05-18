"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEndpointAction } from "@/features/config/use-cases/update-endpoint/update-endpoint";
import { ActionFeedback } from "@/features/shared/components/action-feedback/action-feedback";
import type { ActionState } from "@/features/shared/types/action-state";

const INITIAL_STATE: ActionState = { status: "idle" };

type EndpointFormDict = {
  endpointInputLabel: string;
  endpointInputPlaceholder: string;
  endpointSave: string;
  endpointClear: string;
  endpointSaving: string;
  endpointSuccess: string;
  endpointInvalidUrl: string;
};

type Props = {
  currentEndpoint: string;
  dict: EndpointFormDict;
};

export function EndpointForm({ currentEndpoint, dict }: Props) {
  const [state, formAction, pending] = useActionState(updateEndpointAction, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-4">
      {state.status === "success" && (
        <ActionFeedback variant="success" message={dict.endpointSuccess} />
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endpoint-input">{dict.endpointInputLabel}</Label>
          <Input
            id="endpoint-input"
            name="endpoint"
            type="url"
            placeholder={dict.endpointInputPlaceholder}
            defaultValue={currentEndpoint}
            autoComplete="off"
            aria-invalid={state.status === "error" ? true : undefined}
          />
          {state.status === "error" && (
            <p className="text-xs text-destructive">{state.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? dict.endpointSaving : dict.endpointSave}
          </Button>
        </div>
      </form>

      <form action={formAction}>
        <input type="hidden" name="endpoint" value="" />
        <Button type="submit" variant="outline" disabled={pending}>
          {dict.endpointClear}
        </Button>
      </form>
    </div>
  );
}
