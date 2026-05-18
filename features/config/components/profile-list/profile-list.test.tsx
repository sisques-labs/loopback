import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";

// Mock server actions
const mockExportProfilesAction = vi.fn();
const mockImportProfilesAction = vi.fn();

vi.mock(
  "@/features/config/use-cases/export-profiles/export-profiles",
  () => ({ exportProfilesAction: (...args: unknown[]) => mockExportProfilesAction(...args) }),
);

vi.mock(
  "@/features/config/use-cases/import-profiles/import-profiles",
  () => ({ importProfilesAction: (...args: unknown[]) => mockImportProfilesAction(...args) }),
);

// Mock child components to isolate ProfileList logic
vi.mock("@/features/config/components/profile-card/profile-card", () => ({
  ProfileCard: vi.fn(({ profile, onEdit }: { profile: { name: string }; onEdit: (p: unknown) => void }) => (
    <div data-testid={`profile-card-${profile.name}`}>
      <button onClick={() => onEdit(profile)}>Edit {profile.name}</button>
    </div>
  )),
}));

vi.mock("@/features/config/components/profile-form/profile-form", () => ({
  ProfileForm: vi.fn(({ mode }: { mode: string }) => (
    <div data-testid="profile-form" data-mode={mode} />
  )),
}));

const mockUseActionState = vi.fn();

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: (...args: unknown[]) => mockUseActionState(...args),
  };
});

import { ProfileList } from "./profile-list";
import { MAX_PROFILES } from "@/lib/aws/profiles";
import type { Profile } from "@/lib/aws/profiles";

const profiles: Profile[] = [
  { id: "dev-id", name: "dev", endpoint: "http://localhost:4566", region: "us-east-1" },
  { id: "staging-id", name: "staging", endpoint: "http://staging:4566", region: "eu-west-1" },
];

const dict = {
  profilesSectionTitle: "Environment Profiles",
  profilesCounter: "{{count}}/10 profiles",
  profileAdd: "Create profile",
  profileEmpty: "No profiles yet",
  profileNameLabel: "Profile name",
  profileNamePlaceholder: "e.g. dev, staging",
  profileEndpointLabel: "Endpoint URL",
  profileEndpointPlaceholder: "http://localhost:4566",
  profileRegionLabel: "Region",
  profileSave: "Save",
  profileEdit: "Edit",
  profileDelete: "Delete",
  profileActivate: "Activate",
  profileDeactivate: "Deactivate",
  profileActiveBadge: "Active",
  profileDeleteActive: "Deactivate the profile before deleting it",
  profileDeleteConfirm: "Are you sure you want to delete this profile?",
  profileCreateSuccess: "Profile created",
  profileUpdateSuccess: "Profile updated",
  profileNameDuplicate: "A profile with this name already exists",
  profileCapReached: "Maximum of 10 profiles reached",
  profileInvalidEndpoint: "Must be a valid absolute URL",
  profileInvalidRegion: "Must be a valid AWS region",
  profileExport: "Export profiles",
  profileImport: "Import profiles",
  profileImportSuccess: "{{count}} profile(s) imported",
  profileImportTruncated: "Imported {{count}} profile(s). {{skipped}} skipped (cap reached or duplicates).",
  profileImportNoValidProfiles: "No valid profiles found in file",
  profileImportFileTooLarge: "File too large or wrong format",
  profileImportError: "Invalid file format",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ProfileList — with profiles", () => {
  it("renders one ProfileCard per profile", () => {
    render(
      <ProfileList profiles={profiles} activeProfileId={null} dict={dict} />,
    );

    expect(screen.getByTestId("profile-card-dev")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card-staging")).toBeInTheDocument();
  });

  it("shows the profile count", () => {
    render(
      <ProfileList profiles={profiles} activeProfileId={null} dict={dict} />,
    );

    expect(screen.getByText("2/10 profiles")).toBeInTheDocument();
  });

  it("shows create button enabled when below cap", () => {
    render(
      <ProfileList profiles={profiles} activeProfileId={null} dict={dict} />,
    );

    expect(screen.getByRole("button", { name: new RegExp(dict.profileAdd, "i") })).not.toBeDisabled();
  });

  it("shows create button disabled when at cap", () => {
    const atCapProfiles = Array.from({ length: MAX_PROFILES }, (_, i) => ({
      id: `id-${i}`,
      name: `profile-${i}`,
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    }));

    render(
      <ProfileList profiles={atCapProfiles} activeProfileId={null} dict={dict} />,
    );

    expect(screen.getByRole("button", { name: new RegExp(dict.profileAdd, "i") })).toBeDisabled();
  });

  it("clicking create button shows ProfileForm in create mode", async () => {
    const user = userEvent.setup();

    render(
      <ProfileList profiles={profiles} activeProfileId={null} dict={dict} />,
    );

    await user.click(screen.getByRole("button", { name: new RegExp(dict.profileAdd, "i") }));

    const form = screen.getByTestId("profile-form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("data-mode", "create");
  });

  it("clicking edit on a ProfileCard shows ProfileForm in edit mode", async () => {
    const user = userEvent.setup();

    render(
      <ProfileList profiles={profiles} activeProfileId={null} dict={dict} />,
    );

    await user.click(screen.getByText("Edit dev"));

    const form = screen.getByTestId("profile-form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("data-mode", "edit");
  });

  it("does NOT show form initially", () => {
    render(
      <ProfileList profiles={profiles} activeProfileId={null} dict={dict} />,
    );

    expect(screen.queryByTestId("profile-form")).not.toBeInTheDocument();
  });
});

describe("ProfileList — empty state", () => {
  it("shows empty state message when no profiles exist", () => {
    render(
      <ProfileList profiles={[]} activeProfileId={null} dict={dict} />,
    );

    expect(screen.getByText(dict.profileEmpty)).toBeInTheDocument();
  });

  it("shows 0/10 count when no profiles", () => {
    render(
      <ProfileList profiles={[]} activeProfileId={null} dict={dict} />,
    );

    expect(screen.getByText("0/10 profiles")).toBeInTheDocument();
  });
});

describe("ProfileList — export button", () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeEach(() => {
    createObjectURL = vi.fn(() => "blob:mock-url");
    revokeObjectURL = vi.fn();
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("export button is visible when profiles exist", () => {
    render(<ProfileList profiles={profiles} activeProfileId={null} dict={dict} />);
    expect(screen.getByRole("button", { name: dict.profileExport })).toBeInTheDocument();
  });

  it("export button is visible when no profiles exist (empty state)", () => {
    render(<ProfileList profiles={[]} activeProfileId={null} dict={dict} />);
    expect(screen.getByRole("button", { name: dict.profileExport })).toBeInTheDocument();
  });

  it("clicking export calls exportProfilesAction", async () => {
    const user = userEvent.setup();
    mockExportProfilesAction.mockResolvedValue({ status: "success", data: "[]" });

    render(<ProfileList profiles={profiles} activeProfileId={null} dict={dict} />);

    await user.click(screen.getByRole("button", { name: dict.profileExport }));

    expect(mockExportProfilesAction).toHaveBeenCalledOnce();
  });

  it("clicking export triggers a file download via createObjectURL", async () => {
    const user = userEvent.setup();
    mockExportProfilesAction.mockResolvedValue({ status: "success", data: "[]" });

    render(<ProfileList profiles={profiles} activeProfileId={null} dict={dict} />);

    await user.click(screen.getByRole("button", { name: dict.profileExport }));

    expect(createObjectURL).toHaveBeenCalledOnce();
  });
});

describe("ProfileList — import button", () => {
  it("import button is visible when profiles exist", () => {
    render(<ProfileList profiles={profiles} activeProfileId={null} dict={dict} />);
    expect(screen.getByRole("button", { name: dict.profileImport })).toBeInTheDocument();
  });

  it("import button is visible in empty state", () => {
    render(<ProfileList profiles={[]} activeProfileId={null} dict={dict} />);
    expect(screen.getByRole("button", { name: dict.profileImport })).toBeInTheDocument();
  });

  it("import button is disabled when at MAX_PROFILES cap", () => {
    const atCapProfiles = Array.from({ length: MAX_PROFILES }, (_, i) => ({
      id: `id-${i}`,
      name: `profile-${i}`,
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    }));

    render(<ProfileList profiles={atCapProfiles} activeProfileId={null} dict={dict} />);

    expect(screen.getByRole("button", { name: dict.profileImport })).toBeDisabled();
  });

  it("shows success message after successful import", async () => {
    const user = userEvent.setup();
    mockImportProfilesAction.mockResolvedValue({
      status: "success",
      data: { imported: 2, skipped: 0 },
    });

    render(<ProfileList profiles={profiles} activeProfileId={null} dict={dict} />);

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(['[{"id":"a","name":"dev","endpoint":"http://localhost","region":"us-east-1"}]'], "profiles.json", { type: "application/json" });
    await user.upload(fileInput, file);

    expect(await screen.findByText(/2 profile\(s\) imported/i)).toBeInTheDocument();
  });

  it("shows error message when import fails (invalid JSON)", async () => {
    const user = userEvent.setup();
    mockImportProfilesAction.mockResolvedValue({
      status: "error",
      message: "Invalid file format",
    });

    render(<ProfileList profiles={profiles} activeProfileId={null} dict={dict} />);

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["not json"], "bad.json", { type: "application/json" });
    await user.upload(fileInput, file);

    expect(await screen.findByText(/Invalid file format/i)).toBeInTheDocument();
  });
});
