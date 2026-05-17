"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
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
import { JsonTextarea } from "@/features/shared/components/json-textarea/json-textarea";
import { putItemAction } from "@/features/dynamodb/use-cases/put-item/put-item";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import type { ActionState } from "@/features/shared/types/action-state";

const INITIAL_STATE: ActionState = { status: "idle" };

function buildItemExampleJson(partitionKeyName: string, sortKeyName?: string): string {
  const lines = [`  "${partitionKeyName}": "item-1",`];
  if (sortKeyName) {
    lines.push(`  "${sortKeyName}": "v1",`);
  }
  lines.push('  "name": "Prueba"');
  return `{\n${lines.join("\n")}\n}`;
}

type Props = {
  tableName: string;
  partitionKeyName: string;
  sortKeyName?: string;
  dict: AppDict["dynamodb"]["putItemDialog"];
  locale: Locale;
  closeLabel: string;
};

export function PutItemDialog({
  tableName,
  partitionKeyName,
  sortKeyName,
  dict,
  locale, closeLabel}: Props) {
  const exampleJson = buildItemExampleJson(partitionKeyName, sortKeyName);
  const [state, formAction, pending] = useActionState(putItemAction, INITIAL_STATE);
  const [itemJsonValid, setItemJsonValid] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(dict.successToast);
      closeRef.current?.click();
    }
  }, [state, dict.successToast]);

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9" />}>
        <PlusIcon />
        {dict.trigger}
      </DialogTrigger>
      <DialogContent closeLabel={closeLabel} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{dict.description}</p>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <JsonTextarea
              name="itemJson"
              label={dict.jsonLabel}
              placeholder={exampleJson}
              rows={8}
              onValidityChange={setItemJsonValid}
            />
            <p className="text-xs text-muted-foreground">{dict.jsonHint}</p>
            {state.status === "error" && (
              <p className="text-xs text-destructive">{state.message}</p>
            )}
          </div>

          <input type="hidden" name="tableName" value={tableName} />
          <input type="hidden" name="locale" value={locale} />

          <DialogFooter>
            <DialogClose ref={closeRef} render={<Button variant="outline" type="button" />}>
              {dict.cancel}
            </DialogClose>
            <Button type="submit" disabled={pending || !itemJsonValid}>
              {pending ? dict.saving : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
