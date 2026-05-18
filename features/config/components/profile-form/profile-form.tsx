"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProfileAction } from "@/features/config/use-cases/create-profile/create-profile";
import { updateProfileFormAction } from "@/features/config/use-cases/update-profile/update-profile";
import { AWS_REGIONS } from "@/lib/aws/regions";
import { ActionFeedback } from "@/features/shared/components/action-feedback/action-feedback";
import type { ActionState } from "@/features/shared/types/action-state";
import type { Profile } from "@/lib/aws/profiles";

const INITIAL_STATE: ActionState = { status: "idle" };

type ProfileFormDict = {
  profileNameLabel: string;
  profileNamePlaceholder: string;
  profileEndpointLabel: string;
  profileEndpointPlaceholder: string;
  profileRegionLabel: string;
  profileSave: string;
  profileCreateSuccess: string;
  profileUpdateSuccess: string;
  profileNameDuplicate: string;
  profileInvalidEndpoint: string;
  profileInvalidRegion: string;
};

type Props =
  | { mode: "create"; profile?: undefined; dict: ProfileFormDict; onSuccess?: () => void }
  | { mode: "edit"; profile: Profile; dict: ProfileFormDict; onSuccess?: () => void };

export function ProfileForm({ mode, profile, dict, onSuccess }: Props) {
  const action = mode === "create" ? createProfileAction : updateProfileFormAction;

  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  if (state.status === "success" && onSuccess) {
    onSuccess();
  }

  const successMessage = mode === "create" ? dict.profileCreateSuccess : dict.profileUpdateSuccess;

  return (
    <div className="flex flex-col gap-4">
      {state.status === "success" && (
        <ActionFeedback variant="success" message={successMessage} />
      )}

      <form action={formAction} className="flex flex-col gap-3">
        {mode === "edit" && profile && (
          <input type="hidden" name="id" value={profile.id} />
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name">{dict.profileNameLabel}</Label>
          <Input
            id="profile-name"
            name="name"
            type="text"
            placeholder={dict.profileNamePlaceholder}
            defaultValue={mode === "edit" ? profile?.name : ""}
            maxLength={64}
            autoComplete="off"
            aria-invalid={state.status === "error" ? true : undefined}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-endpoint">{dict.profileEndpointLabel}</Label>
          <Input
            id="profile-endpoint"
            name="endpoint"
            type="url"
            placeholder={dict.profileEndpointPlaceholder}
            defaultValue={mode === "edit" ? profile?.endpoint : ""}
            autoComplete="off"
            aria-invalid={state.status === "error" ? true : undefined}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-region">{dict.profileRegionLabel}</Label>
          <select
            id="profile-region"
            name="region"
            defaultValue={mode === "edit" ? profile?.region : AWS_REGIONS[0].value}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={state.status === "error" ? true : undefined}
          >
            {AWS_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {state.status === "error" && (
          <p className="text-xs text-destructive">{state.message}</p>
        )}

        <Button type="submit" disabled={pending} className="w-fit">
          {dict.profileSave}
        </Button>
      </form>
    </div>
  );
}
