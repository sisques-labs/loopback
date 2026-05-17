"use client";

import { useState, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JsonTextarea } from "@/features/shared/components/json-textarea/json-textarea";
import { updateItemAction } from "@/features/dynamodb/use-cases/update-item/update-item";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import type { ActionState } from "@/features/shared/types/action-state";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  tableName: string;
  item: Record<string, unknown>;
  partitionKeyName: string;
  sortKeyName?: string;
  dict: AppDict["dynamodb"]["editItemDialog"];
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeLabel: string;
};

function buildKeyObject(
  item: Record<string, unknown>,
  partitionKeyName: string,
  sortKeyName?: string,
): Record<string, unknown> {
  const key: Record<string, unknown> = { [partitionKeyName]: item[partitionKeyName] };
  if (sortKeyName && item[sortKeyName] !== undefined) {
    key[sortKeyName] = item[sortKeyName];
  }
  return key;
}

function formatKeyValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function EditItemDialog({
  tableName,
  item,
  partitionKeyName,
  sortKeyName,
  dict,
  locale,
  open,
  onOpenChange, closeLabel}: Props) {
  const [state, formAction, pending] = useActionState(updateItemAction, INITIAL_STATE);
  const [itemJsonValid, setItemJsonValid] = useState(true);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(dict.successToast);
      onOpenChange(false);
    }
  }, [state, dict.successToast, onOpenChange]);

  const keyObject = buildKeyObject(item, partitionKeyName, sortKeyName);
  const keyEntries = Object.entries(keyObject);
  const initialItemJson = JSON.stringify(item, null, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={closeLabel} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{dict.description}</p>

        {/* Key fields — locked, read-only */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">{dict.keyFieldsLabel}</p>
          <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/40 px-3 py-2">
            {keyEntries.map(([name, value]) => (
              <div key={name} className="flex items-center gap-2 text-sm">
                <span className="font-mono font-medium">{name}:</span>
                <span className="font-mono text-muted-foreground">
                  {formatKeyValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overwrite warning */}
        <p className="text-xs text-muted-foreground">{dict.overwriteWarning}</p>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <JsonTextarea
              key={JSON.stringify(keyObject)}
              name="itemJson"
              label={dict.jsonLabel}
              defaultValue={initialItemJson}
              rows={10}
              onValidityChange={setItemJsonValid}
            />
            <p className="text-xs text-muted-foreground">{dict.jsonHint}</p>
            {state.status === "error" && (
              <p className="text-xs text-destructive">{state.message}</p>
            )}
          </div>

          <input type="hidden" name="tableName" value={tableName} />
          <input type="hidden" name="keyJson" value={JSON.stringify(keyObject)} />
          <input type="hidden" name="locale" value={locale} />

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
              onClick={() => onOpenChange(false)}
            >
              {dict.cancel}
            </Button>
            <Button
              type="submit"
              disabled={pending || !itemJsonValid}
              className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
            >
              {pending ? dict.saving : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
