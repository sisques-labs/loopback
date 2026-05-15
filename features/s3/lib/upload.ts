export type UploadResult =
  | { ok: true; key: string }
  | { ok: false; error: string; code?: string };

export type UploadOptions = {
  bucket: string;
  file: File;
  onProgress?: (percent: number) => void;
  onFinalizing?: () => void;
  signal?: AbortSignal;
};

/**
 * Upload a file to S3 via XHR so we get granular progress events.
 * Never throws — always resolves with UploadResult.
 * POST /api/aws/s3/[bucket]/objects (unchanged route, multipart/form-data).
 */
export function uploadFile(opts: UploadOptions): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", opts.file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    // Bytes sent — server is still processing (finalizing state)
    xhr.upload.onload = () => opts.onFinalizing?.();

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText) as { ok: boolean; key?: string; error?: string; code?: string };
        if (xhr.status >= 200 && xhr.status < 300 && json.ok) {
          resolve({ ok: true, key: json.key ?? "" });
        } else {
          resolve({ ok: false, error: json.error ?? "Upload failed.", code: json.code });
        }
      } catch {
        resolve({ ok: false, error: "Upload failed." });
      }
    };

    xhr.onerror = () => resolve({ ok: false, error: "Network error." });
    xhr.onabort = () => resolve({ ok: false, error: "Aborted." });

    opts.signal?.addEventListener("abort", () => xhr.abort());

    xhr.open("POST", `/api/aws/s3/${encodeURIComponent(opts.bucket)}/objects`);
    xhr.send(fd);
  });
}
