"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTableAction } from "@/features/dynamodb/use-cases/create-table/create-table";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import type { ActionState } from "@/features/shared/types/action-state";

const INITIAL_STATE: ActionState = { status: "idle" };
const KEY_TYPES = ["S", "N", "B"] as const;

type Props = {
  dict: AppDict["dynamodb"]["createTableDialog"];
  locale: Locale;

    closeLabel: string;
};

export function CreateTableDialog({ dict, locale, closeLabel}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createTableAction, INITIAL_STATE);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [hasSortKey, setHasSortKey] = useState(false);
  const [tableNameValue, setTableNameValue] = useState("");

  useEffect(() => {
    if (state.status === "success") {
      toast.success(dict.successToast);
      closeRef.current?.click();
      router.push(`/${locale}/dynamodb/${tableNameValue}`);
    }
  }, [state, dict.successToast, locale, router, tableNameValue]);

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9" />}>
        <PlusIcon />
        {dict.trigger}
      </DialogTrigger>
      <DialogContent closeLabel={closeLabel}>
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {/* Table name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="table-name">{dict.nameLabel}</Label>
            <Input
              id="table-name"
              name="tableName"
              placeholder={dict.namePlaceholder}
              autoComplete="off"
              required
              value={tableNameValue}
              onChange={(e) => setTableNameValue(e.target.value)}
              aria-invalid={state.status === "error" ? true : undefined}
            />
            <p className="text-xs text-muted-foreground">{dict.nameHint}</p>
            {state.status === "error" && (
              <p className="text-xs text-destructive">{state.message}</p>
            )}
          </div>

          {/* Partition key name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pk-name">{dict.pkNameLabel}</Label>
            <Input
              id="pk-name"
              name="partitionKeyName"
              placeholder="pk"
              autoComplete="off"
              required
            />
          </div>

          {/* Partition key type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pk-type">{dict.pkTypelabel}</Label>
            <select
              id="pk-type"
              name="partitionKeyType"
              required
              defaultValue="S"
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {KEY_TYPES.map((kt) => (
                <option key={kt} value={kt}>
                  {kt === "S" ? "String (S)" : kt === "N" ? "Number (N)" : "Binary (B)"}
                </option>
              ))}
            </select>
          </div>

          {/* Add sort key toggle */}
          <div className="flex items-center gap-2">
            <input
              id="add-sort-key"
              type="checkbox"
              checked={hasSortKey}
              onChange={(e) => setHasSortKey(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="add-sort-key" className="cursor-pointer">
              {dict.addSortKey}
            </Label>
          </div>

          {/* Sort key fields — conditionally shown */}
          {hasSortKey && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sk-name">{dict.skNameLabel}</Label>
                <Input
                  id="sk-name"
                  name="sortKeyName"
                  placeholder="sk"
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sk-type">{dict.skTypeLabel}</Label>
                <select
                  id="sk-type"
                  name="sortKeyType"
                  defaultValue="S"
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {KEY_TYPES.map((kt) => (
                    <option key={kt} value={kt}>
                      {kt === "S" ? "String (S)" : kt === "N" ? "Number (N)" : "Binary (B)"}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <input type="hidden" name="locale" value={locale} />

          <DialogFooter>
            <DialogClose ref={closeRef} render={<Button variant="outline" type="button" />}>
              {dict.cancel}
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? dict.creating : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
