import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@/features/snapshots/use-cases/import-snapshot/import-snapshot",
  () => ({ importSnapshotAction: vi.fn() }),
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

import { ImportExportPanel } from "./import-export-panel";
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

describe("ImportExportPanel", () => {
  it("renders the file input for importing", () => {
    render(<ImportExportPanel dict={dict} />);
    // File input or import button should be rendered
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it("export button is disabled when no snapshot is in the store", () => {
    storeState.snapshot = null;
    render(<ImportExportPanel dict={dict} />);
    const exportBtn = screen.getByRole("button", { name: /export snapshot/i });
    expect(exportBtn).toBeDisabled();
  });

  it("export button is enabled when a snapshot is in the store", () => {
    storeState.snapshot = {
      version: "1",
      createdAt: new Date().toISOString(),
      endpoint: "http://localhost:4566",
      dynamodb: [],
      sqs: [],
      s3: [],
    };
    render(<ImportExportPanel dict={dict} />);
    const exportBtn = screen.getByRole("button", { name: /export snapshot/i });
    expect(exportBtn).not.toBeDisabled();
  });
});
