import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/config/use-cases/activate-profile/activate-profile", () => ({
  activateProfileAction: vi.fn(),
}));
vi.mock("@/features/config/use-cases/deactivate-profile/deactivate-profile", () => ({
  deactivateProfileAction: vi.fn(),
}));
vi.mock("@/features/config/use-cases/delete-profile/delete-profile", () => ({
  deleteProfileAction: vi.fn(),
}));

const mockUseActionState = vi.fn();

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: (...args: unknown[]) => mockUseActionState(...args),
  };
});

import { ProfileCard } from "./profile-card";
import type { Profile } from "@/lib/aws/profiles";

const profile: Profile = {
  id: "dev-id",
  name: "dev",
  endpoint: "http://localhost:4566",
  region: "us-east-1",
};

const dict = {
  profileActiveBadge: "Active",
  profileActivate: "Activate",
  profileDeactivate: "Deactivate",
  profileEdit: "Edit",
  profileDelete: "Delete",
  profileDeleteActive: "Deactivate the profile before deleting it",
  profileDeleteConfirm: "Are you sure you want to delete this profile?",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ProfileCard — inactive profile", () => {
  it("renders the profile name", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={vi.fn()} />);

    expect(screen.getByText("dev")).toBeInTheDocument();
  });

  it("renders the endpoint", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={vi.fn()} />);

    expect(screen.getByText("http://localhost:4566")).toBeInTheDocument();
  });

  it("renders the region", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={vi.fn()} />);

    expect(screen.getByText("us-east-1")).toBeInTheDocument();
  });

  it("does NOT show the Active badge when isActive=false", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={vi.fn()} />);

    expect(screen.queryByText(dict.profileActiveBadge)).not.toBeInTheDocument();
  });

  it("shows an activate button when not active", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={vi.fn()} />);

    const buttons = screen.getAllByRole("button");
    const activateButton = buttons.find((b) => b.textContent === dict.profileActivate);
    expect(activateButton).toBeDefined();
  });

  it("does NOT show a deactivate button when not active", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={vi.fn()} />);

    const buttons = screen.queryAllByRole("button");
    const deactivateButton = buttons.find((b) => b.textContent === dict.profileDeactivate);
    expect(deactivateButton).toBeUndefined();
  });

  it("shows an edit button", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: new RegExp(dict.profileEdit, "i") })).toBeInTheDocument();
  });

  it("shows a delete button enabled when isActive=false", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: new RegExp(dict.profileDelete, "i") })).not.toBeDisabled();
  });

  it("calls onEdit when the edit button is clicked", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    const onEdit = vi.fn();
    render(<ProfileCard profile={profile} isActive={false} dict={dict} onEdit={onEdit} />);

    screen.getByRole("button", { name: new RegExp(dict.profileEdit, "i") }).click();

    expect(onEdit).toHaveBeenCalledWith(profile);
  });
});

describe("ProfileCard — active profile", () => {
  it("shows the Active badge when isActive=true", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={true} dict={dict} onEdit={vi.fn()} />);

    expect(screen.getByText(dict.profileActiveBadge)).toBeInTheDocument();
  });

  it("shows a deactivate button when active", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={true} dict={dict} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: new RegExp(dict.profileDeactivate, "i") })).toBeInTheDocument();
  });

  it("does NOT show an activate button when active", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={true} dict={dict} onEdit={vi.fn()} />);

    // Use exact text match to avoid matching "Deactivate" when searching for "Activate"
    const buttons = screen.getAllByRole("button");
    const activateButton = buttons.find((b) => b.textContent === dict.profileActivate);
    expect(activateButton).toBeUndefined();
  });

  it("shows a delete button disabled when isActive=true", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileCard profile={profile} isActive={true} dict={dict} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: new RegExp(dict.profileDelete, "i") })).toBeDisabled();
  });
});
