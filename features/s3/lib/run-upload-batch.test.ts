import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runUploadBatch } from "./run-upload-batch";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/features/s3/lib/upload", () => ({
  uploadFile: vi.fn(),
}));

vi.mock("@/features/shared/stores/upload-progress-store", () => ({
  useUploadProgressStore: {
    getState: vi.fn(() => ({
      addItem: vi.fn(() => "mock-id"),
      updateProgress: vi.fn(),
      setStatus: vi.fn(),
    })),
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFile(name: string): File {
  return new File(["content"], name, { type: "text/plain" });
}

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

// ── Tests ──────────────────────────────────────────────────────────────────

describe("runUploadBatch — dedup detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls toast.warning and NOT uploadFile when two files share the same name", async () => {
    const { toast } = await import("sonner");
    const { uploadFile } = await import("@/features/s3/lib/upload");

    const files = [makeFile("report.pdf"), makeFile("image.png"), makeFile("report.pdf")];

    await runUploadBatch({ bucket: "test-bucket", files, dict });

    expect(toast.warning).toHaveBeenCalledOnce();
    expect(toast.warning).toHaveBeenCalledWith(dict.duplicateWarning);
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("returns {ok:0, failed:0} on duplicate detection without uploading anything", async () => {
    const files = [makeFile("a.txt"), makeFile("a.txt")];
    const result = await runUploadBatch({ bucket: "test-bucket", files, dict });

    expect(result).toEqual({ ok: 0, failed: 0 });
  });
});

describe("runUploadBatch — semaphore (max 3 concurrent)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("never has more than 3 uploadFile calls in-flight simultaneously", async () => {
    const { uploadFile } = await import("@/features/s3/lib/upload");

    let inFlight = 0;
    let maxInFlight = 0;

    // Each call increments inFlight, waits a tick, then decrements and resolves
    (uploadFile as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      // Simulate async work with a resolved promise (one microtask tick)
      await Promise.resolve();
      inFlight--;
      return { ok: true, key: "k" };
    });

    const files = Array.from({ length: 6 }, (_, i) => makeFile(`file${i}.txt`));
    await runUploadBatch({ bucket: "test-bucket", files, dict });

    expect(maxInFlight).toBeLessThanOrEqual(3);
    expect(maxInFlight).toBeGreaterThanOrEqual(1);
  });
});

describe("runUploadBatch — per-file toasts + batch summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows success toast per successful file, error toast per failure, and batchSummary at the end", async () => {
    const { toast } = await import("sonner");
    const { uploadFile } = await import("@/features/s3/lib/upload");

    (uploadFile as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, key: "file1.txt" })
      .mockResolvedValueOnce({ ok: true, key: "file2.txt" })
      .mockRejectedValueOnce(new Error("Network fail"));

    const files = [makeFile("file1.txt"), makeFile("file2.txt"), makeFile("file3.txt")];
    const result = await runUploadBatch({ bucket: "test-bucket", files, dict });

    expect(result).toEqual({ ok: 2, failed: 1 });
    // 2 per-file success toasts + 1 batchSummary success toast = 3 total
    expect(toast.success).toHaveBeenCalledTimes(3);
    expect(toast.error).toHaveBeenCalledTimes(1);
    // batchSummary is shown last
    expect(toast.success).toHaveBeenLastCalledWith("2 uploaded, 1 failed");
  });

  it("calls onDone callback after all files settle", async () => {
    const { uploadFile } = await import("@/features/s3/lib/upload");
    (uploadFile as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, key: "x" });

    const onDone = vi.fn();
    const files = [makeFile("a.txt"), makeFile("b.txt")];
    await runUploadBatch({ bucket: "test-bucket", files, dict, onDone });

    expect(onDone).toHaveBeenCalledOnce();
  });
});
