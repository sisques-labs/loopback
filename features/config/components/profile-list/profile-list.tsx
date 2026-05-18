"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/features/config/components/profile-card/profile-card";
import { ProfileForm } from "@/features/config/components/profile-form/profile-form";
import { MAX_PROFILES } from "@/lib/aws/profiles";
import type { Profile } from "@/lib/aws/profiles";
import { exportProfilesAction } from "@/features/config/use-cases/export-profiles/export-profiles";
import { importProfilesAction } from "@/features/config/use-cases/import-profiles/import-profiles";
import { ActionFeedback } from "@/features/shared/components/action-feedback/action-feedback";
import { downloadJson } from "@/lib/utils";

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
  profileExport: string;
  profileImport: string;
  profileImportSuccess: string;
  profileImportTruncated: string;
  profileImportNoValidProfiles: string;
  profileImportFileTooLarge: string;
  profileImportError: string;
};

type FormState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; profile: Profile };

type ImportFeedback =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

type Props = {
  profiles: Profile[];
  activeProfileId: string | null;
  dict: ProfileListDict;
};

export function ProfileList({ profiles, activeProfileId, dict }: Props) {
  const [formState, setFormState] = useState<FormState>({ open: false });
  const [importFeedback, setImportFeedback] = useState<ImportFeedback>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleExport() {
    const result = await exportProfilesAction();
    if (result.status !== "success") return;
    downloadJson("loopback-profiles.json", result.data);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const result = await importProfilesAction(text);

    if (result.status === "success") {
      const { imported, skipped } = result.data as { imported: number; skipped: number };
      let message: string;
      if (skipped > 0) {
        message = dict.profileImportTruncated
          .replace("{{count}}", String(imported))
          .replace("{{skipped}}", String(skipped));
      } else {
        message = dict.profileImportSuccess.replace("{{count}}", String(imported));
      }
      setImportFeedback({ kind: "success", message });
    } else {
      const errorMsg = result.status === "error" ? result.message : undefined;
      setImportFeedback({ kind: "error", message: errorMsg ?? dict.profileImportError });
    }

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            {dict.profileExport}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={atCap}
            onClick={handleImportClick}
          >
            {dict.profileImport}
          </Button>
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
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Import feedback */}
      {importFeedback && (
        <ActionFeedback variant={importFeedback.kind} message={importFeedback.message} />
      )}

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
