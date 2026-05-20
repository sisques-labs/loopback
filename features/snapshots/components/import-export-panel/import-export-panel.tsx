"use client";

import { useActionState } from "react";
import { importSnapshotAction } from "@/features/snapshots/use-cases/import-snapshot/import-snapshot";
import { useSnapshotStore } from "@/features/snapshots/stores/use-snapshot-store/use-snapshot-store";
import type { ActionState } from "@/features/shared/types/action-state";
import type { SnapshotDocument } from "@/features/snapshots/lib/types/snapshot";
import type { SnapshotsDict } from "@/features/snapshots/i18n/en";

const INITIAL_STATE: ActionState<SnapshotDocument> = { status: "idle" };

type Props = {
  dict: SnapshotsDict;
};

export function ImportExportPanel({ dict }: Props) {
  const snapshot = useSnapshotStore((s) => s.snapshot);
  const setSnapshot = useSnapshotStore((s) => s.setSnapshot);
  const [state, formAction, pending] = useActionState(
    importSnapshotAction,
    INITIAL_STATE,
  );

  // Sync imported snapshot into the store
  if (state.status === "success" && state.data) {
    setSnapshot(state.data);
  }

  async function handleExport() {
    if (!snapshot) return;
    try {
      const res = await fetch("/api/snapshots/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot }),
      });
      if (!res.ok) return;

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "loopback-snapshot.json";

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // swallow — non-critical
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{dict.importExport.sectionTitle}</h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Import */}
        <form action={formAction}>
          <label className="flex cursor-pointer flex-col items-start gap-2">
            <input
              type="file"
              name="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const form = e.currentTarget.form;
                if (form && e.currentTarget.files?.[0]) {
                  form.requestSubmit();
                }
              }}
            />
            <span className="min-h-11 inline-flex items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 cursor-pointer">
              {pending ? dict.importExport.importing : dict.importExport.importButton}
            </span>
          </label>
        </form>

        {/* Export */}
        <button
          type="button"
          disabled={!snapshot}
          onClick={handleExport}
          className="min-h-11 w-full rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {dict.importExport.exportButton}
        </button>
      </div>

      {state.status === "success" && (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          {dict.importExport.importSuccess}
        </p>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-destructive">{dict.importExport.importError}</p>
          <p className="text-xs text-muted-foreground">{state.message}</p>
        </div>
      )}
    </div>
  );
}
