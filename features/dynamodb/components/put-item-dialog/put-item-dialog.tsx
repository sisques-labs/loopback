"use client";

import { useActionState, useEffect, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { putItemAction } from "@/features/dynamodb/use-cases/put-item/put-item";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import type { ActionState } from "@/features/shared/types/action-state";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  tableName: string;
  dict: AppDict["dynamodb"]["putItemDialog"];
  locale: Locale;
};

export function PutItemDialog({ tableName, dict, locale }: Props) {
  const [state, formAction, pending] = useActionState(putItemAction, INITIAL_STATE);
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{dict.description}</p>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-json">{dict.jsonLabel}</Label>
            <textarea
              id="item-json"
              name="itemJson"
              placeholder={dict.jsonPlaceholder}
              rows={8}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={state.status === "error" ? true : undefined}
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
            <Button type="submit" disabled={pending}>
              {pending ? dict.saving : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
