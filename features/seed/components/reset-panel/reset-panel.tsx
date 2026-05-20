"use client";

import { useActionState } from "react";
import { resetEnvironmentAction } from "@/features/seed/use-cases/reset-environment/reset-environment";
import { ResultsTable, type ResultsTableDict } from "@/features/seed/components/results-table/results-table";
import type { ActionState } from "@/features/shared/types/action-state";
import type { ResetReport } from "@/features/seed/types";

export type ResetPanelDict = {
  sectionTitle: string;
  sectionDescription: string;
  previewButton: string;
  previewing: string;
  confirmButton: string;
  confirming: string;
  previewTitle: string;
  successTitle: string;
  errorTitle: string;
  noResources: string;
};

const INITIAL_STATE: ActionState<ResetReport> = { status: "idle" };

type Props = {
  dict: ResetPanelDict;
  resultsDict: ResultsTableDict;
};

export function ResetPanel({ dict, resultsDict }: Props) {
  const [state, formAction, pending] = useActionState(
    resetEnvironmentAction,
    INITIAL_STATE,
  );

  const isDryRunDone =
    state.status === "success" && state.data.dryRun === true;

  const isExecuteDone =
    state.status === "success" && state.data.dryRun === false;

  return (
    <div id="reset" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{dict.sectionTitle}</h2>
        <p className="text-muted-foreground text-sm">{dict.sectionDescription}</p>
      </div>

      {/* Step 1: Preview button */}
      {!isDryRunDone && !isExecuteDone && (
        <form action={formAction}>
          <input type="hidden" name="dryRun" value="true" />
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {pending ? dict.previewing : dict.previewButton}
          </button>
        </form>
      )}

      {/* Step 2: Dry-run results + Confirm button */}
      {isDryRunDone && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{dict.previewTitle}</h3>
            <ResultsTable
              results={state.data.results}
              dict={resultsDict}
            />
          </div>

          <p className="text-sm text-destructive font-medium">
            This will delete ALL resources in your local environment. This action cannot be undone.
          </p>

          <form action={formAction}>
            <input type="hidden" name="dryRun" value="false" />
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 w-full rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {pending ? dict.confirming : dict.confirmButton}
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Execute results */}
      {isExecuteDone && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {dict.successTitle}
          </p>
          <ResultsTable
            results={state.data.results}
            dict={resultsDict}
          />
        </div>
      )}

      {/* Error state */}
      {state.status === "error" && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-destructive">{dict.errorTitle}</p>
          <p className="text-xs text-muted-foreground">{state.message}</p>
        </div>
      )}
    </div>
  );
}
