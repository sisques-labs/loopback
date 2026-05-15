"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { renameObjectAction } from "@/features/s3/use-cases/rename-object/rename-object";
import type { ActionState } from "@/features/shared/types/action-state";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

const INITIAL_STATE: ActionState<{ newKey: string }> = { status: "idle" };

type Props = {
  bucket: string;
  objectKey: string;
  dict: AppDict["s3"]["renameObjectDialog"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Inner component mounted with key={objectKey} so React remounts it whenever
 * the target object changes, resetting all state (input value + action state)
 * without needing a setState-in-effect pattern.
 */
function RenameObjectDialogInner({
  bucket,
  objectKey,
  dict,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [newKey, setNewKey] = useState(objectKey);
  const [state, formAction, pending] = useActionState(renameObjectAction, INITIAL_STATE);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(dict.success);
      router.refresh();
      onOpenChange(false);
    }
    if (state.status === "error") {
      toast.error(state.message ?? dict.failed);
    }
  }, [state, dict.success, dict.failed, router, onOpenChange]);

  // Client-side validation (mirrors server-side rules)
  let clientError: string | null = null;
  if (newKey === "") clientError = dict.emptyKey;
  else if (newKey.startsWith("/")) clientError = dict.leadingSlash;
  else if (newKey.length > 1024) clientError = dict.tooLong;
  else if (newKey === objectKey) clientError = dict.sameKey;

  const isInvalid = clientError !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="bucket" value={bucket} />
          <input type="hidden" name="oldKey" value={objectKey} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rename-object-key">{dict.keyLabel}</Label>
            <Input
              id="rename-object-key"
              name="newKey"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              autoComplete="off"
              aria-invalid={isInvalid ? true : undefined}
            />
            {clientError && (
              <p className="text-xs text-destructive">{clientError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              {dict.cancel}
            </DialogClose>
            <Button type="submit" disabled={pending || isInvalid}>
              {pending ? dict.renaming : dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Stable public wrapper. Passing key={objectKey} resets all inner state
 * (controlled input + useActionState) whenever the target object changes.
 */
export function RenameObjectDialog(props: Props) {
  return <RenameObjectDialogInner key={props.objectKey} {...props} />;
}
