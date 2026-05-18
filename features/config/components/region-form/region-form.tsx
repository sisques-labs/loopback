"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateRegionAction } from "@/features/config/use-cases/update-region/update-region";
import { AWS_REGIONS } from "@/lib/aws/regions";
import type { ActionState } from "@/features/shared/types/action-state";

const INITIAL_STATE: ActionState = { status: "idle" };

type RegionFormDict = {
  regionInputLabel: string;
  regionDescription: string;
  regionPlaceholder: string;
  regionSave: string;
  regionSaving: string;
  regionSuccess: string;
  regionInvalid: string;
  regionProfileActiveInfo: string;
};

type Props = {
  currentRegion: string;
  hasActiveProfile: boolean;
  dict: RegionFormDict;
};

export function RegionForm({ currentRegion, hasActiveProfile, dict }: Props) {
  const [state, formAction, pending] = useActionState(updateRegionAction, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-4">
      {hasActiveProfile && (
        <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {dict.regionProfileActiveInfo}
        </p>
      )}

      {state.status === "success" && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          {dict.regionSuccess}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="region-select">{dict.regionInputLabel}</Label>
          <select
            id="region-select"
            name="region"
            defaultValue={currentRegion}
            disabled={hasActiveProfile || pending}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={state.status === "error" ? true : undefined}
          >
            {AWS_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {state.status === "error" && (
            <p className="text-xs text-destructive">{state.message}</p>
          )}
        </div>

        <Button type="submit" disabled={hasActiveProfile || pending} className="w-fit">
          {pending ? dict.regionSaving : dict.regionSave}
        </Button>
      </form>
    </div>
  );
}
