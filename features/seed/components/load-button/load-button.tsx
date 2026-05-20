"use client";

import { useActionState } from "react";
import { loadDemoDatasetAction } from "@/features/seed/use-cases/load-demo-dataset/load-demo-dataset";
import { ResultsTable } from "@/features/seed/components/results-table/results-table";
import type { PresetSlug } from "@/features/seed/presets/schema";
import type { ActionState } from "@/features/shared/types/action-state";
import type { LoadReport } from "@/features/seed/types";

export type LoadButtonDict = {
  button: string;
  loading: string;
  noPresetSelected: string;
  successTitle: string;
  errorTitle: string;
};

const RESULTS_DICT = {
  tableTitle: "Results",
  service: "Service",
  created: "Created",
  skipped: "Skipped",
  failed: "Failed",
};

const INITIAL_STATE: ActionState<LoadReport> = { status: "idle" };

type Props = {
  selectedPreset: PresetSlug | undefined;
  dict: LoadButtonDict;
};

export function LoadButton({ selectedPreset, dict }: Props) {
  const [state, formAction, pending] = useActionState(
    loadDemoDatasetAction,
    INITIAL_STATE,
  );

  const isDisabled = !selectedPreset || pending;

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction}>
        {selectedPreset && (
          <input type="hidden" name="preset" value={selectedPreset} />
        )}
        <button
          type="submit"
          disabled={isDisabled}
          className="min-h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {pending ? dict.loading : dict.button}
        </button>
      </form>

      {!selectedPreset && (
        <p className="text-xs text-muted-foreground">{dict.noPresetSelected}</p>
      )}

      {state.status === "success" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {dict.successTitle}
          </p>
          <ResultsTable results={state.data.results} dict={RESULTS_DICT} />
        </div>
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-destructive">{dict.errorTitle}</p>
          <p className="text-xs text-muted-foreground">{state.message}</p>
        </div>
      )}
    </div>
  );
}
