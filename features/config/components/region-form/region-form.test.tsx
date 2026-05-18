import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/config/use-cases/update-region/update-region", () => ({
  updateRegionAction: vi.fn(),
}));

const mockUseActionState = vi.fn();

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: (...args: unknown[]) => mockUseActionState(...args),
  };
});

import { RegionForm } from "./region-form";

const dict = {
  regionInputLabel: "Region",
  regionDescription: "Select the AWS region for your local environment",
  regionPlaceholder: "Select a region",
  regionSave: "Save",
  regionSaving: "Saving…",
  regionSuccess: "Region updated",
  regionInvalid: "Must be a valid AWS region",
  regionProfileActiveInfo:
    "Region is controlled by the active profile. Edit the profile to change it.",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("RegionForm — no active profile", () => {
  it("renders a region selector", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="us-east-1" hasActiveProfile={false} dict={dict} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("pre-selects the current region", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="us-west-2" hasActiveProfile={false} dict={dict} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("us-west-2");
  });

  it("renders a save button", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="us-east-1" hasActiveProfile={false} dict={dict} />);

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("shows success banner when state is success", () => {
    mockUseActionState.mockReturnValue([{ status: "success", data: undefined }, vi.fn(), false]);

    render(<RegionForm currentRegion="us-east-1" hasActiveProfile={false} dict={dict} />);

    expect(screen.getByText(dict.regionSuccess)).toBeInTheDocument();
  });

  it("does not show success banner when state is idle", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="us-east-1" hasActiveProfile={false} dict={dict} />);

    expect(screen.queryByText(dict.regionSuccess)).not.toBeInTheDocument();
  });

  it("the selector is NOT disabled when no active profile", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="us-east-1" hasActiveProfile={false} dict={dict} />);

    expect(screen.getByRole("combobox")).not.toBeDisabled();
  });

  it("does NOT show the profile active info message when no active profile", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="us-east-1" hasActiveProfile={false} dict={dict} />);

    expect(screen.queryByText(dict.regionProfileActiveInfo)).not.toBeInTheDocument();
  });
});

describe("RegionForm — with active profile", () => {
  it("shows the profile-active info message", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="eu-west-1" hasActiveProfile={true} dict={dict} />);

    expect(screen.getByText(dict.regionProfileActiveInfo)).toBeInTheDocument();
  });

  it("disables the region selector when active profile is set", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="eu-west-1" hasActiveProfile={true} dict={dict} />);

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("disables the save button when active profile is set", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<RegionForm currentRegion="eu-west-1" hasActiveProfile={true} dict={dict} />);

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });
});
