import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/snapshots/use-cases/restore-snapshot/restore-snapshot",
  () => ({ restoreSnapshotAction: vi.fn() }),
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

// Mock Zustand store
const storeState = {
  snapshot: null as Record<string, unknown> | null,
};
vi.mock("@/features/snapshots/stores/use-snapshot-store/use-snapshot-store", () => ({
  useSnapshotStore: vi.fn((selector: (s: typeof storeState) => unknown) => selector(storeState)),
}));

import { RestorePanel } from "./restore-panel";
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
  storeState.snapshot = null;
});

describe("RestorePanel", () => {
  it("shows no-snapshot message when snapshot is null", () => {
    storeState.snapshot = null;
    render(<RestorePanel dict={dict} />);
    expect(screen.getByText(/no snapshot to restore/i)).toBeInTheDocument();
  });

  it("renders the Restore snapshot button when snapshot exists", () => {
    storeState.snapshot = {
      version: "1",
      createdAt: new Date().toISOString(),
      endpoint: "http://localhost:4566",
      dynamodb: [],
      sqs: [],
      s3: [],
    };
    render(<RestorePanel dict={dict} />);
    expect(screen.getByRole("button", { name: /restore snapshot/i })).toBeInTheDocument();
  });

  it("button has min-h-11 touch target class", () => {
    storeState.snapshot = {
      version: "1",
      createdAt: new Date().toISOString(),
      endpoint: "http://localhost:4566",
      dynamodb: [],
      sqs: [],
      s3: [],
    };
    render(<RestorePanel dict={dict} />);
    const btn = screen.getByRole("button", { name: /restore snapshot/i });
    expect(btn.className).toContain("min-h-11");
  });
});
