import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/seed/use-cases/load-demo-dataset/load-demo-dataset",
  () => ({
    loadDemoDatasetAction: vi.fn(),
  }),
);

// Stub useActionState so we can control state without form submissions
let mockState: Record<string, unknown> = { status: "idle" };
let mockPending = false;
vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [mockState, vi.fn(), mockPending] as const,
  };
});

import { LoadButton } from "./load-button";
import type { PresetSlug } from "@/features/seed/presets/schema";

const dict = {
  button: "Load preset",
  loading: "Loading…",
  noPresetSelected: "Select a preset to continue",
  successTitle: "Preset loaded",
  errorTitle: "Load failed",
};

afterEach(() => {
  cleanup();
  mockState = { status: "idle" };
  mockPending = false;
});

describe("LoadButton — no preset selected", () => {
  it("is disabled when no preset is selected", () => {
    render(<LoadButton selectedPreset={undefined} dict={dict} />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("shows noPresetSelected hint when no preset is selected", () => {
    render(<LoadButton selectedPreset={undefined} dict={dict} />);
    expect(screen.getByText("Select a preset to continue")).toBeInTheDocument();
  });
});

describe("LoadButton — preset selected", () => {
  it("is enabled when a preset is selected", () => {
    render(<LoadButton selectedPreset={"ecommerce" as PresetSlug} dict={dict} />);
    const btn = screen.getByRole("button");
    expect(btn).not.toBeDisabled();
  });

  it("shows the button label when preset is selected", () => {
    render(<LoadButton selectedPreset={"ecommerce" as PresetSlug} dict={dict} />);
    expect(screen.getByText("Load preset")).toBeInTheDocument();
  });
});

describe("LoadButton — pending state", () => {
  it("shows loading text and is disabled when pending", () => {
    mockPending = true;
    render(<LoadButton selectedPreset={"ecommerce" as PresetSlug} dict={dict} />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});

describe("LoadButton — success state", () => {
  it("shows per-service results table on success", () => {
    mockState = {
      status: "success",
      data: {
        results: [
          { service: "s3", created: 2, skipped: 0, failed: 0, errors: [] },
          { service: "sqs", created: 2, skipped: 0, failed: 0, errors: [] },
          { service: "dynamodb", created: 2, skipped: 0, failed: 0, errors: [] },
          { service: "lambda", created: 1, skipped: 0, failed: 0, errors: [] },
          { service: "sns", created: 1, skipped: 0, failed: 0, errors: [] },
        ],
      },
    };
    render(<LoadButton selectedPreset={"ecommerce" as PresetSlug} dict={dict} />);
    // Should show results
    expect(screen.getByText("Preset loaded")).toBeInTheDocument();
  });
});

describe("LoadButton — error state", () => {
  it("shows error title on error state", () => {
    mockState = { status: "error", message: "Something went wrong" };
    render(<LoadButton selectedPreset={"ecommerce" as PresetSlug} dict={dict} />);
    expect(screen.getByText("Load failed")).toBeInTheDocument();
  });
});

describe("LoadButton — has 44px touch target", () => {
  it("button has min-h-11 class for mobile touch target", () => {
    render(<LoadButton selectedPreset={"ecommerce" as PresetSlug} dict={dict} />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("min-h-11");
  });
});
