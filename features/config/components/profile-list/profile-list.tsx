"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/features/config/components/profile-card/profile-card";
import { ProfileForm } from "@/features/config/components/profile-form/profile-form";
import { MAX_PROFILES } from "@/lib/aws/profiles";
import type { Profile } from "@/lib/aws/profiles";

type ProfileListDict = {
  profilesSectionTitle: string;
  profilesCounter: string;
  profileAdd: string;
  profileEmpty: string;
  profileNameLabel: string;
  profileNamePlaceholder: string;
  profileEndpointLabel: string;
  profileEndpointPlaceholder: string;
  profileRegionLabel: string;
  profileSave: string;
  profileEdit: string;
  profileDelete: string;
  profileActivate: string;
  profileDeactivate: string;
  profileActiveBadge: string;
  profileDeleteActive: string;
  profileDeleteConfirm: string;
  profileCreateSuccess: string;
  profileUpdateSuccess: string;
  profileNameDuplicate: string;
  profileCapReached: string;
  profileInvalidEndpoint: string;
  profileInvalidRegion: string;
};

type FormState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; profile: Profile };

type Props = {
  profiles: Profile[];
  activeProfileId: string | null;
  dict: ProfileListDict;
};

export function ProfileList({ profiles, activeProfileId, dict }: Props) {
  const [formState, setFormState] = useState<FormState>({ open: false });

  const atCap = profiles.length >= MAX_PROFILES;

  const counter = dict.profilesCounter.replace("{{count}}", String(profiles.length));

  function handleCreate() {
    setFormState({ open: true, mode: "create" });
  }

  function handleEdit(profile: Profile) {
    setFormState({ open: true, mode: "edit", profile });
  }

  function handleFormSuccess() {
    setFormState({ open: false });
  }

  const profileCardDict = {
    profileActiveBadge: dict.profileActiveBadge,
    profileActivate: dict.profileActivate,
    profileDeactivate: dict.profileDeactivate,
    profileEdit: dict.profileEdit,
    profileDelete: dict.profileDelete,
    profileDeleteActive: dict.profileDeleteActive,
    profileDeleteConfirm: dict.profileDeleteConfirm,
  };

  const profileFormDict = {
    profileNameLabel: dict.profileNameLabel,
    profileNamePlaceholder: dict.profileNamePlaceholder,
    profileEndpointLabel: dict.profileEndpointLabel,
    profileEndpointPlaceholder: dict.profileEndpointPlaceholder,
    profileRegionLabel: dict.profileRegionLabel,
    profileSave: dict.profileSave,
    profileCreateSuccess: dict.profileCreateSuccess,
    profileUpdateSuccess: dict.profileUpdateSuccess,
    profileNameDuplicate: dict.profileNameDuplicate,
    profileInvalidEndpoint: dict.profileInvalidEndpoint,
    profileInvalidRegion: dict.profileInvalidRegion,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{counter}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={atCap}
          onClick={handleCreate}
        >
          {dict.profileAdd}
        </Button>
      </div>

      {formState.open && formState.mode === "create" && (
        <ProfileForm
          mode="create"
          dict={profileFormDict}
          onSuccess={handleFormSuccess}
        />
      )}

      {formState.open && formState.mode === "edit" && (
        <ProfileForm
          mode="edit"
          profile={formState.profile}
          dict={profileFormDict}
          onSuccess={handleFormSuccess}
        />
      )}

      {profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dict.profileEmpty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.id === activeProfileId}
              dict={profileCardDict}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
