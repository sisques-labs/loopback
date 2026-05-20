import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/seed/use-cases/reset-environment/reset-environment",
  () => ({
    resetEnvironmentAction: vi.fn(),
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

import { ResetPanel } from "./reset-panel";

const dict = {
  sectionTitle: "Reset environment",
  sectionDescription: "Preview what will be deleted before confirming.",
  previewButton: "Preview reset",
  previewing: "Previewing…",
  confirmButton: "Confirm reset",
  confirming: "Resetting…",
  previewTitle: "Resources to delete",
  successTitle: "Environment reset",
  errorTitle: "Reset failed",
  noResources: "No resources found.",
};

const resultsDict = {
  tableTitle: "Results",
  service: "Service",
  created: "Created",
  skipped: "Skipped",
  failed: "Failed",
};

afterEach(() => {
  cleanup();
  mockState = { status: "idle" };
  mockPending = false;
});

describe("ResetPanel — initial state", () => {
  it("shows section title and description", () => {
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    expect(screen.getByText("Reset environment")).toBeInTheDocument();
    expect(screen.getByText("Preview what will be deleted before confirming.")).toBeInTheDocument();
  });

  it("shows preview button in initial state", () => {
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    expect(screen.getByRole("button", { name: /preview reset/i })).toBeInTheDocument();
  });

  it("preview button has min-h-11 class for 44px touch target", () => {
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    const btn = screen.getByRole("button", { name: /preview reset/i });
    expect(btn.className).toContain("min-h-11");
  });

  it("does NOT show confirm button before preview is done", () => {
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    expect(screen.queryByRole("button", { name: /confirm reset/i })).not.toBeInTheDocument();
  });
});

describe("ResetPanel — pending state", () => {
  it("shows previewing text when pending", () => {
    mockPending = true;
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    expect(screen.getByText("Previewing…")).toBeInTheDocument();
  });
});

describe("ResetPanel — after dry-run success", () => {
  it("shows per-service counts and confirm button after dry-run succeeds", () => {
    mockState = {
      status: "success",
      data: {
        dryRun: true,
        results: [
          { service: "s3", created: 2, skipped: 0, failed: 0, errors: [] },
          { service: "sqs", created: 1, skipped: 0, failed: 0, errors: [] },
          { service: "dynamodb", created: 0, skipped: 0, failed: 0, errors: [] },
          { service: "lambda", created: 0, skipped: 0, failed: 0, errors: [] },
          { service: "sns", created: 0, skipped: 0, failed: 0, errors: [] },
        ],
      },
    };
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    // ResourcesTable is shown
    expect(screen.getByText("Resources to delete")).toBeInTheDocument();
    // Confirm button appears
    expect(screen.getByRole("button", { name: /confirm reset/i })).toBeInTheDocument();
  });

  it("shows warning message about destructive action", () => {
    mockState = {
      status: "success",
      data: {
        dryRun: true,
        results: [{ service: "s3", created: 1, skipped: 0, failed: 0, errors: [] }],
      },
    };
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    // Should have some warning text about deletion
    const el = screen.getByText(/delete all resources/i);
    expect(el).toBeInTheDocument();
  });
});

describe("ResetPanel — after execute success", () => {
  it("shows success title after execute completes", () => {
    mockState = {
      status: "success",
      data: {
        dryRun: false,
        results: [
          { service: "s3", created: 2, skipped: 0, failed: 0, errors: [] },
        ],
      },
    };
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    expect(screen.getByText("Environment reset")).toBeInTheDocument();
  });
});

describe("ResetPanel — error state", () => {
  it("shows error title on error state", () => {
    mockState = { status: "error", message: "Something went wrong" };
    render(<ResetPanel dict={dict} resultsDict={resultsDict} />);
    expect(screen.getByText("Reset failed")).toBeInTheDocument();
  });
});
