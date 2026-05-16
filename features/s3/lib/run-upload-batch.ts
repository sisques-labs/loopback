import { toast } from "sonner";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import { t } from "@/features/shared/i18n/interpolate";
import { uploadFile } from "@/features/s3/lib/upload";
import { useUploadProgressStore } from "@/features/shared/stores/upload-progress-store";

type RunUploadBatchArgs = {
  bucket: string;
  files: File[];
  dict: AppDict["s3"]["uploadDialog"];
  onDone?: () => void;
};

type BatchResult = { ok: number; failed: number };

/**
 * Upload a batch of files to S3 with:
 * - Duplicate name pre-flight check (blocks entire batch on match)
 * - 3-slot worker-pool semaphore (never more than 3 concurrent XHRs)
 * - Per-file success / error toasts
 * - Batch-summary toast after all files settle
 * - `onDone` callback (e.g. router.refresh) after all settle
 */
export async function runUploadBatch({
  bucket,
  files,
  dict,
  onDone,
}: RunUploadBatchArgs): Promise<BatchResult> {
  // ── Dedup pre-flight ──────────────────────────────────────────────────────
  const names = files.map((f) => f.name);
  if (new Set(names).size < names.length) {
    toast.warning(dict.duplicateWarning);
    return { ok: 0, failed: 0 };
  }

  if (files.length === 0) {
    return { ok: 0, failed: 0 };
  }

  // ── Register all files in the progress store before any XHR ──────────────
  const store = useUploadProgressStore.getState();
  const ids = files.map((f) => store.addItem({ bucket, filename: f.name }));

  // ── Worker-pool semaphore (3 slots) ───────────────────────────────────────
  let ok = 0;
  let failed = 0;
  let cursor = 0;

  async function uploadOne(file: File, storeId: string): Promise<void> {
    try {
      const result = await uploadFile({
        bucket,
        file,
        onProgress: (p) => useUploadProgressStore.getState().updateProgress(storeId, p),
        onFinalizing: () =>
          useUploadProgressStore.getState().setStatus(storeId, "finalizing"),
      });

      if (result.ok) {
        useUploadProgressStore.getState().setStatus(storeId, "done");
        toast.success(t(dict.successFile, { name: file.name }));
        ok++;
      } else {
        useUploadProgressStore.getState().setStatus(storeId, "error", result.error);
        toast.error(t(dict.errorFile, { name: file.name }));
        failed++;
      }
    } catch {
      useUploadProgressStore.getState().setStatus(storeId, "error", dict.failed);
      toast.error(t(dict.errorFile, { name: file.name }));
      failed++;
    }
  }

  async function worker(): Promise<void> {
    while (cursor < files.length) {
      const idx = cursor++;
      await uploadOne(files[idx], ids[idx]);
    }
  }

  // Start 3 workers (or fewer if batch is smaller)
  const slots = Math.min(3, files.length);
  await Promise.all(Array.from({ length: slots }, () => worker()));

  // ── Batch summary ─────────────────────────────────────────────────────────
  toast.success(t(dict.batchSummary, { ok: String(ok), failed: String(failed) }));

  onDone?.();

  return { ok, failed };
}
