import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/snapshots/use-cases/create-snapshot/create-snapshot",
  () => ({ createSnapshotAction: vi.fn() }),
);

let mockState: Record<string, unknown> = { status: "idle" };
let mockPending = false;
vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [mockState, vi.fn(), mockPending] as const,
  };
});

import { SnapshotPanel } from "./snapshot-panel";
import type { SnapshotsDict } from "@/features/snapshots/i18n/en";

const dict: SnapshotsDict = {
  page: { title: "Snapshots", description: "Capture your environment." },
  create: {
    sectionTitle: "Create Snapshot",
    button: "Create snapshot",
    creating: "Capturing…",
    successTitle: "Snapshot created",
    errorTitle: "Capture failed",
    itemGuardWarn: "Table {{table}} has {{count}} items — may be slow.",
    itemGuardReject: "Table {{table}} exceeds 50K limit.",
    partialSuccess: "Snapshot created with {{count}} unavailable.",
  },
  importExport: {
    sectionTitle: "Import / Export",
    exportButton: "Export snapshot",
    importButton: "Import snapshot",
    importing: "Importing…",
    importSuccess: "Snapshot imported",
    importError: "Invalid snapshot file",
    fileTooLarge: "File too large",
    noSnapshot: "No snapshot loaded",
  },
  restore: {
    sectionTitle: "Restore",
    button: "Restore snapshot",
    restoring: "Restoring…",
    successTitle: "Restore complete",
    errorTitle: "Restore failed",
    noSnapshot: "No snapshot to restore. Create or import one first.",
    snapshotInfo: "Snapshot from {{date}} — {{tables}} tables, {{queues}} queues, {{buckets}} buckets",
  },
  results: {
    service: "Service",
    resource: "Resource",
    status: "Status",
    statusCreated: "Created",
    statusSkipped: "Skipped",
    statusFailed: "Failed",
  },
};

afterEach(() => {
  cleanup();
  mockState = { status: "idle" };
  mockPending = false;
});

describe("SnapshotPanel", () => {
  it("renders the Create snapshot button", () => {
    render(<SnapshotPanel dict={dict} />);
    expect(screen.getByRole("button", { name: /create snapshot/i })).toBeInTheDocument();
  });

  it("shows creating state text when pending", () => {
    mockPending = true;
    render(<SnapshotPanel dict={dict} />);
    expect(screen.getByText(/capturing/i)).toBeInTheDocument();
  });

  it("button has min-h-11 touch target class", () => {
    render(<SnapshotPanel dict={dict} />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("min-h-11");
  });
});
