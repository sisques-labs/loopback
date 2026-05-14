export type UploadCodeResult =
  | { ok: true; functionName: string }
  | { ok: false; error: string; code?: string };

export type UploadCodeOptions = {
  functionName: string;
  file: File;
  onProgress?: (percent: number) => void;
  onFinalizing?: () => void;
  signal?: AbortSignal;
};

/**
 * Upload a Lambda deployment package (.zip) via XHR for upload progress events.
 * Never throws — always resolves with UploadCodeResult.
 * POST /api/aws/lambda/[functionName]/code (multipart/form-data, field "file").
 */
export function uploadLambdaCode(opts: UploadCodeOptions): Promise<UploadCodeResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", opts.file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.upload.onload = () => opts.onFinalizing?.();

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText) as {
          ok: boolean;
          functionName?: string;
          error?: string;
          code?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && json.ok) {
          resolve({ ok: true, functionName: json.functionName ?? opts.functionName });
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

    const segment = encodeURIComponent(opts.functionName);
    xhr.open("POST", `/api/aws/lambda/${segment}/code`);
    xhr.send(fd);
  });
}
