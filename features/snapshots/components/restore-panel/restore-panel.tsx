"use client";

import { useActionState } from "react";
import { restoreSnapshotAction } from "@/features/snapshots/use-cases/restore-snapshot/restore-snapshot";
import { useSnapshotStore } from "@/features/snapshots/stores/use-snapshot-store/use-snapshot-store";
import type { ActionState } from "@/features/shared/types/action-state";
import type { RestoreReport } from "@/features/snapshots/lib/types/snapshot";
import type { SnapshotsDict } from "@/features/snapshots/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

const INITIAL_STATE: ActionState<RestoreReport> = { status: "idle" };

type Props = {
  dict: WidenStringLiterals<SnapshotsDict>;
};

export function RestorePanel({ dict }: Props) {
  const snapshot = useSnapshotStore((s) => s.snapshot);
  const [state, formAction, pending] = useActionState(
    restoreSnapshotAction,
    INITIAL_STATE,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{dict.restore.sectionTitle}</h2>
      </div>

      {!snapshot ? (
        <p className="text-sm text-muted-foreground">{dict.restore.noSnapshot}</p>
      ) : (
        <form action={formAction}>
          {/* Serialize the snapshot into the form so the Server Action can read it */}
          <input
            type="hidden"
            name="snapshot"
            value={JSON.stringify(snapshot)}
          />
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {pending ? dict.restore.restoring : dict.restore.button}
          </button>
        </form>
      )}

      {state.status === "success" && (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          {dict.restore.successTitle}
        </p>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-destructive">{dict.restore.errorTitle}</p>
          <p className="text-xs text-muted-foreground">{state.message}</p>
        </div>
      )}
    </div>
  );
}
