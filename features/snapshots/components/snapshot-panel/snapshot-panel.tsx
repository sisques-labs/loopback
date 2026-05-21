"use client";

import { useActionState, useEffect } from "react";
import { createSnapshotAction } from "@/features/snapshots/use-cases/create-snapshot/create-snapshot";
import { useSnapshotStore } from "@/features/snapshots/stores/use-snapshot-store/use-snapshot-store";
import type { ActionState } from "@/features/shared/types/action-state";
import type { SnapshotCreateReport } from "@/features/snapshots/lib/types/snapshot";
import type { SnapshotsDict } from "@/features/snapshots/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

const INITIAL_STATE: ActionState<SnapshotCreateReport> = { status: "idle" };

type Props = {
  dict: WidenStringLiterals<SnapshotsDict>;
};

export function SnapshotPanel({ dict }: Props) {
  const setSnapshot = useSnapshotStore((s) => s.setSnapshot);
  const [state, formAction, pending] = useActionState(
    createSnapshotAction,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === "success" && state.data.document) {
      setSnapshot(state.data.document);
    }
  }, [state, setSnapshot]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{dict.create.sectionTitle}</h2>
      </div>

      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {pending ? dict.create.creating : dict.create.button}
        </button>
      </form>

      {state.status === "success" && (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          {dict.create.successTitle}
        </p>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-destructive">{dict.create.errorTitle}</p>
          <p className="text-xs text-muted-foreground">{state.message}</p>
        </div>
      )}
    </div>
  );
}
