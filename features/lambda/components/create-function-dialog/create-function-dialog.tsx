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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFunctionAction } from "@/features/lambda/use-cases/create-function/create-function";
import { SUPPORTED_RUNTIMES, DEFAULT_LAMBDA_ROLE_ARN, DEFAULT_HANDLER } from "@/features/lambda/lib/runtimes";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import type { ActionState } from "@/features/shared/types/action-state";

const INITIAL_STATE: ActionState = { status: "idle" };

type Props = {
  dict: AppDict["lambda"]["createFunctionDialog"];
  locale: Locale;
};

export function CreateFunctionDialog({ dict, locale }: Props) {
  const [state, formAction, pending] = useActionState(createFunctionAction, INITIAL_STATE);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {/* Function name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fn-name">{dict.nameLabel}</Label>
            <Input
              id="fn-name"
              name="name"
              placeholder={dict.namePlaceholder}
              autoComplete="off"
              required
              aria-invalid={state.status === "error" ? true : undefined}
            />
            {state.status === "error" && (
              <p className="text-xs text-destructive">{state.message}</p>
            )}
          </div>

          {/* Runtime */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fn-runtime">{dict.runtimeLabel}</Label>
            <select
              id="fn-runtime"
              name="runtime"
              required
              defaultValue=""
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                {dict.runtimePlaceholder}
              </option>
              {SUPPORTED_RUNTIMES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>

          {/* Handler */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fn-handler">{dict.handlerLabel}</Label>
            <Input
              id="fn-handler"
              name="handler"
              placeholder={dict.handlerPlaceholder}
              defaultValue={DEFAULT_HANDLER}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">{dict.handlerHint}</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fn-description">{dict.descriptionLabel}</Label>
            <Input
              id="fn-description"
              name="description"
              placeholder={dict.descriptionPlaceholder}
              autoComplete="off"
            />
          </div>

          {/* Role ARN */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fn-role">{dict.roleLabel}</Label>
            <Input
              id="fn-role"
              name="role"
              defaultValue={DEFAULT_LAMBDA_ROLE_ARN}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">{dict.roleHint}</p>
          </div>

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
