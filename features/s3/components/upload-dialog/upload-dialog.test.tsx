import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UploadDialog } from "./upload-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/s3/lib/upload", () => ({
  uploadFile: vi.fn(),
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
  cancel: "Cancel",
  uploading: "Uploading…",
  submit: "Upload",
  selectFile: "Please select a file.",
  failed: "Upload failed.",
  failedNetwork: "Upload failed. Check your connection.",
  success: "Uploaded {key}",
};

describe("UploadDialog", () => {
  afterEach(() => {
    cleanup();
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
});
