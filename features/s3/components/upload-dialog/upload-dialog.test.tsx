import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UploadDialog } from "./upload-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock("@/features/s3/lib/upload", () => ({
  uploadFile: vi.fn(),
}));

vi.mock("@/features/s3/lib/run-upload-batch", () => ({
  runUploadBatch: vi.fn().mockResolvedValue({ ok: 1, failed: 0 }),
}));

vi.mock("@/features/shared/stores/upload-progress-store", () => ({
  useUploadProgressStore: {
    getState: () => ({
      addItem: vi.fn(() => "id"),
      updateProgress: vi.fn(),
      setStatus: vi.fn(),
    }),
  },
}));

const dict = {
  trigger: "Upload",
  title: "Upload file",
  fileLabel: "File",
  fileLabelMulti: "Files",
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

describe("UploadDialog", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses a 44px mobile touch target on the trigger button", () => {
    render(
      <UploadDialog bucket="my-bucket" dict={dict} closeLabel="Close" />,
    );

    const trigger = screen.getByRole("button", { name: /Upload/i });
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
    expect(trigger.className).toContain("md:min-h-9");
    expect(trigger.className).toContain("md:min-w-9");
  });

  it("file input has the multiple attribute", async () => {
    render(
      <UploadDialog bucket="my-bucket" dict={dict} closeLabel="Close" />,
    );

    // Open the dialog
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Upload/i }));
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute("multiple");
  });

  it("sets data-dragging=true on dragEnter and clears it on dragLeave", async () => {
    render(
      <UploadDialog bucket="my-bucket" dict={dict} closeLabel="Close" />,
    );

    // Open the dialog
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Upload/i }));
    });

    // The dialog panel root
    const dialogPanel = document.querySelector("[data-slot='dialog-content']") as HTMLElement;
    expect(dialogPanel).not.toBeNull();

    // Drag enter
    act(() => {
      fireEvent.dragEnter(dialogPanel, { dataTransfer: { files: [] } });
    });
    expect(dialogPanel).toHaveAttribute("data-dragging", "true");

    // Drag leave
    act(() => {
      fireEvent.dragLeave(dialogPanel, { dataTransfer: { files: [] } });
    });
    expect(dialogPanel).not.toHaveAttribute("data-dragging", "true");
  });

  it("clears data-dragging on drop and calls runUploadBatch", async () => {
    const { runUploadBatch } = await import("@/features/s3/lib/run-upload-batch");

    render(
      <UploadDialog bucket="my-bucket" dict={dict} closeLabel="Close" />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Upload/i }));
    });

    const dialogPanel = document.querySelector("[data-slot='dialog-content']") as HTMLElement;

    // Simulate drag enter then drop
    act(() => {
      fireEvent.dragEnter(dialogPanel, { dataTransfer: { files: [] } });
    });
    expect(dialogPanel).toHaveAttribute("data-dragging", "true");

    const file = new File(["content"], "test.txt", { type: "text/plain" });

    await act(async () => {
      fireEvent.drop(dialogPanel, {
        dataTransfer: { files: [file] },
      });
    });

    expect(dialogPanel).not.toHaveAttribute("data-dragging", "true");
    expect(runUploadBatch).toHaveBeenCalledWith(
      expect.objectContaining({ bucket: "my-bucket" }),
    );
  });
});
