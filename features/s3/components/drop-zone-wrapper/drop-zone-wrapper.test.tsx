/**
 * JSDOM limitation: JSDOM does not dispatch real drag events across child elements.
 * We simulate events directly on the wrapper div using fireEvent. The counter-ref
 * logic that prevents flicker is tested by firing multiple dragEnter events and
 * verifying the overlay stays visible until a matching number of dragLeave events.
 *
 * @testing-library/user-event is NOT installed — use fireEvent + act from
 * @testing-library/react.
 */

import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DropZoneWrapper } from "./drop-zone-wrapper";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/features/s3/lib/run-upload-batch", () => ({
  runUploadBatch: vi.fn().mockResolvedValue({ ok: 1, failed: 0 }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFile(name: string): File {
  return new File(["content"], name, { type: "text/plain" });
}

const dict = {
  trigger: "Upload",
  title: "Upload file",
  fileLabel: "File",
  selectMultiple: "Files",
  cancel: "Cancel",
  uploading: "Uploading…",
  submit: "Upload",
  selectFile: "Please select a file.",
  failed: "Upload failed.",
  failedNetwork: "Upload failed. Check your connection.",
  success: "Uploaded {key}",
  dropHere: "Drop files to upload",
  uploadingCount: "Uploading {count} files…",
  duplicateWarning: "Duplicate file names detected. Rename and retry.",
  batchSummary: "{ok} uploaded, {failed} failed",
  successFile: "{name} uploaded",
  errorFile: "{name} failed to upload",
} as const;

// ── Tests ──────────────────────────────────────────────────────────────────

describe("DropZoneWrapper", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Task 4.1 — overlay appears on dragEnter, disappears on dragLeave

  it("shows the drop overlay when files are dragged over the wrapper", async () => {
    render(
      <DropZoneWrapper bucket="test-bucket" prefix="" dict={dict}>
        <div data-testid="children">Content</div>
      </DropZoneWrapper>,
    );

    const wrapper = screen.getByTestId("drop-zone-wrapper");

    // Overlay should not be visible initially
    expect(screen.queryByTestId("drop-zone-overlay")).not.toBeInTheDocument();

    act(() => {
      fireEvent.dragEnter(wrapper, { dataTransfer: { files: [] } });
    });

    expect(screen.getByTestId("drop-zone-overlay")).toBeInTheDocument();
  });

  it("hides the drop overlay on dragLeave after a single dragEnter", () => {
    render(
      <DropZoneWrapper bucket="test-bucket" prefix="" dict={dict}>
        <div>Content</div>
      </DropZoneWrapper>,
    );

    const wrapper = screen.getByTestId("drop-zone-wrapper");

    act(() => {
      fireEvent.dragEnter(wrapper, { dataTransfer: { files: [] } });
    });

    expect(screen.getByTestId("drop-zone-overlay")).toBeInTheDocument();

    act(() => {
      fireEvent.dragLeave(wrapper, { dataTransfer: { files: [] } });
    });

    expect(screen.queryByTestId("drop-zone-overlay")).not.toBeInTheDocument();
  });

  it("counter-ref: overlay stays visible across multiple nested dragEnter events and only hides after matching dragLeave count", () => {
    render(
      <DropZoneWrapper bucket="test-bucket" prefix="" dict={dict}>
        <div>Content</div>
      </DropZoneWrapper>,
    );

    const wrapper = screen.getByTestId("drop-zone-wrapper");

    // Two dragEnter events (simulating entry into a child element)
    act(() => {
      fireEvent.dragEnter(wrapper, { dataTransfer: { files: [] } });
      fireEvent.dragEnter(wrapper, { dataTransfer: { files: [] } });
    });

    expect(screen.getByTestId("drop-zone-overlay")).toBeInTheDocument();

    // One dragLeave — overlay should still be visible (counter is 1, not 0)
    act(() => {
      fireEvent.dragLeave(wrapper, { dataTransfer: { files: [] } });
    });

    expect(screen.getByTestId("drop-zone-overlay")).toBeInTheDocument();

    // Second dragLeave — counter reaches 0, overlay should disappear
    act(() => {
      fireEvent.dragLeave(wrapper, { dataTransfer: { files: [] } });
    });

    expect(screen.queryByTestId("drop-zone-overlay")).not.toBeInTheDocument();
  });

  // Task 4.2 — drop triggers runUploadBatch

  it("calls runUploadBatch with correct args on drop", async () => {
    const { runUploadBatch } = await import("@/features/s3/lib/run-upload-batch");

    render(
      <DropZoneWrapper bucket="test-bucket" prefix="" dict={dict}>
        <div>Content</div>
      </DropZoneWrapper>,
    );

    const wrapper = screen.getByTestId("drop-zone-wrapper");
    const file = makeFile("upload.txt");

    act(() => {
      fireEvent.dragEnter(wrapper, { dataTransfer: { files: [file] } });
    });

    await act(async () => {
      fireEvent.drop(wrapper, {
        dataTransfer: { files: [file] },
      });
    });

    expect(runUploadBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "test-bucket",
        files: [file],
      }),
    );
  });

  it("hides overlay after drop", async () => {
    render(
      <DropZoneWrapper bucket="test-bucket" prefix="" dict={dict}>
        <div>Content</div>
      </DropZoneWrapper>,
    );

    const wrapper = screen.getByTestId("drop-zone-wrapper");
    const file = makeFile("upload.txt");

    act(() => {
      fireEvent.dragEnter(wrapper, { dataTransfer: { files: [file] } });
    });

    expect(screen.getByTestId("drop-zone-overlay")).toBeInTheDocument();

    await act(async () => {
      fireEvent.drop(wrapper, { dataTransfer: { files: [file] } });
    });

    expect(screen.queryByTestId("drop-zone-overlay")).not.toBeInTheDocument();
  });

  // Task 4.3 — runUploadBatch handles dedup internally; wrapper passes files through

  it("passes all files to runUploadBatch even if they share the same name (dedup handled inside runUploadBatch)", async () => {
    const { runUploadBatch } = await import("@/features/s3/lib/run-upload-batch");

    render(
      <DropZoneWrapper bucket="test-bucket" prefix="" dict={dict}>
        <div>Content</div>
      </DropZoneWrapper>,
    );

    const wrapper = screen.getByTestId("drop-zone-wrapper");
    const dup1 = makeFile("report.pdf");
    const dup2 = makeFile("report.pdf");

    await act(async () => {
      fireEvent.drop(wrapper, {
        dataTransfer: { files: [dup1, dup2] },
      });
    });

    // runUploadBatch is called — it is responsible for detecting duplicates
    expect(runUploadBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [dup1, dup2],
      }),
    );
  });
});
