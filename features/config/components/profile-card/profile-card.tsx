"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { activateProfileAction } from "@/features/config/use-cases/activate-profile/activate-profile";
import { deactivateProfileAction } from "@/features/config/use-cases/deactivate-profile/deactivate-profile";
import { deleteProfileAction } from "@/features/config/use-cases/delete-profile/delete-profile";
import type { ActionState } from "@/features/shared/types/action-state";
import type { Profile } from "@/lib/aws/profiles";

const INITIAL_STATE: ActionState = { status: "idle" };

type ProfileCardDict = {
  profileActiveBadge: string;
  profileActivate: string;
  profileDeactivate: string;
  profileEdit: string;
  profileDelete: string;
  profileDeleteActive: string;
  profileDeleteConfirm: string;
};

type Props = {
  profile: Profile;
  isActive: boolean;
  dict: ProfileCardDict;
  onEdit: (profile: Profile) => void;
};

export function ProfileCard({ profile, isActive, dict, onEdit }: Props) {
  const boundActivate = activateProfileAction.bind(null, profile.id);
  const boundDeactivate = deactivateProfileAction.bind(null);
  const boundDelete = deleteProfileAction.bind(null, profile.id);

  const [, activateFormAction, activatePending] = useActionState(
    async (prev: ActionState, _formData: FormData) => {
      return await boundActivate();
    },
    INITIAL_STATE,
  );

  const [, deactivateFormAction, deactivatePending] = useActionState(
    async (prev: ActionState, _formData: FormData) => {
      return await boundDeactivate();
    },
    INITIAL_STATE,
  );

  const [, deleteFormAction, deletePending] = useActionState(
    async (prev: ActionState, _formData: FormData) => {
      return await boundDelete();
    },
    INITIAL_STATE,
  );

  const pending = activatePending || deactivatePending || deletePending;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{profile.name}</span>
            {isActive && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                {dict.profileActiveBadge}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{profile.endpoint}</span>
          <span className="text-xs text-muted-foreground">{profile.region}</span>
        </div>

        <div className="flex items-center gap-1">
          {isActive ? (
            <form action={deactivateFormAction}>
              <Button type="submit" variant="outline" size="sm" disabled={pending}>
                {dict.profileDeactivate}
              </Button>
            </form>
          ) : (
            <form action={activateFormAction}>
              <Button type="submit" variant="outline" size="sm" disabled={pending}>
                {dict.profileActivate}
              </Button>
            </form>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => onEdit(profile)}
          >
            {dict.profileEdit}
          </Button>

          <form action={deleteFormAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isActive || pending}
              title={isActive ? dict.profileDeleteActive : undefined}
            >
              {dict.profileDelete}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
