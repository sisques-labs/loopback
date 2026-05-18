import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/config/use-cases/create-profile/create-profile", () => ({
  createProfileAction: vi.fn(),
}));
vi.mock("@/features/config/use-cases/update-profile/update-profile", () => ({
  updateProfileAction: vi.fn(),
}));

const mockUseActionState = vi.fn();

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: (...args: unknown[]) => mockUseActionState(...args),
  };
});

import { ProfileForm } from "./profile-form";
import { AWS_REGIONS } from "@/lib/aws/regions";
import type { Profile } from "@/lib/aws/profiles";

const profile: Profile = {
  id: "dev-id",
  name: "dev",
  endpoint: "http://localhost:4566",
  region: "us-east-1",
};

const dict = {
  profileNameLabel: "Profile name",
  profileNamePlaceholder: "e.g. dev, staging",
  profileEndpointLabel: "Endpoint URL",
  profileEndpointPlaceholder: "http://localhost:4566",
  profileRegionLabel: "Region",
  profileSave: "Save",
  profileCreateSuccess: "Profile created",
  profileUpdateSuccess: "Profile updated",
  profileNameDuplicate: "A profile with this name already exists",
  profileInvalidEndpoint: "Must be a valid absolute URL",
  profileInvalidRegion: "Must be a valid AWS region",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ProfileForm — create mode", () => {
  it("renders the name field", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    expect(screen.getByLabelText(new RegExp(dict.profileNameLabel, "i"))).toBeInTheDocument();
  });

  it("renders the endpoint field", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    expect(screen.getByLabelText(new RegExp(dict.profileEndpointLabel, "i"))).toBeInTheDocument();
  });

  it("renders the region dropdown", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("region dropdown contains all AWS_REGIONS options", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    for (const region of AWS_REGIONS) {
      expect(screen.getByRole("option", { name: region.label })).toBeInTheDocument();
    }
  });

  it("name field starts empty in create mode", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    const nameInput = screen.getByLabelText(new RegExp(dict.profileNameLabel, "i"));
    expect(nameInput).toHaveValue("");
  });

  it("endpoint field starts empty in create mode", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    const endpointInput = screen.getByLabelText(new RegExp(dict.profileEndpointLabel, "i"));
    expect(endpointInput).toHaveValue("");
  });

  it("name field has maxlength=64", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    const nameInput = screen.getByLabelText(new RegExp(dict.profileNameLabel, "i"));
    expect(nameInput).toHaveAttribute("maxlength", "64");
  });

  it("calls useActionState with createProfileAction in create mode", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    // useActionState must be called once (for create), and the first arg should be a function
    expect(mockUseActionState).toHaveBeenCalledOnce();
    expect(typeof mockUseActionState.mock.calls[0][0]).toBe("function");
  });

  it("shows error message when action returns error", () => {
    mockUseActionState.mockReturnValue([
      { status: "error", message: dict.profileNameDuplicate },
      vi.fn(),
      false,
    ]);

    render(<ProfileForm mode="create" dict={dict} />);

    expect(screen.getByText(dict.profileNameDuplicate)).toBeInTheDocument();
  });

  it("shows success state when action returns success", () => {
    mockUseActionState.mockReturnValue([{ status: "success", data: undefined }, vi.fn(), false]);

    render(<ProfileForm mode="create" dict={dict} />);

    expect(screen.getByText(dict.profileCreateSuccess)).toBeInTheDocument();
  });
});

describe("ProfileForm — edit mode", () => {
  it("pre-fills name field with profile name", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="edit" profile={profile} dict={dict} />);

    const nameInput = screen.getByLabelText(new RegExp(dict.profileNameLabel, "i"));
    expect(nameInput).toHaveValue(profile.name);
  });

  it("pre-fills endpoint field with profile endpoint", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="edit" profile={profile} dict={dict} />);

    const endpointInput = screen.getByLabelText(new RegExp(dict.profileEndpointLabel, "i"));
    expect(endpointInput).toHaveValue(profile.endpoint);
  });

  it("pre-selects the profile's region", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="edit" profile={profile} dict={dict} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe(profile.region);
  });

  it("calls useActionState with updateProfileAction in edit mode", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<ProfileForm mode="edit" profile={profile} dict={dict} />);

    // useActionState must be called once (for update), and the first arg should be a function
    expect(mockUseActionState).toHaveBeenCalledOnce();
    expect(typeof mockUseActionState.mock.calls[0][0]).toBe("function");
  });

  it("shows success state when action returns success in edit mode", () => {
    mockUseActionState.mockReturnValue([{ status: "success", data: undefined }, vi.fn(), false]);

    render(<ProfileForm mode="edit" profile={profile} dict={dict} />);

    expect(screen.getByText(dict.profileUpdateSuccess)).toBeInTheDocument();
  });
});
