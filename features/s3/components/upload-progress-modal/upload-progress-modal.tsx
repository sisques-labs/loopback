"use client";

import { useEffect } from "react";
import { useUploadProgressStore } from "@/features/shared/stores/upload-progress-store";
import { cn } from "@/lib/utils";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  dict: AppDict["s3"]["uploadProgress"];
};

export function UploadProgressModal({ dict }: Props) {
  const items = useUploadProgressStore((s) => s.items);
  const isMinimized = useUploadProgressStore((s) => s.isMinimized);
  const setMinimized = useUploadProgressStore((s) => s.setMinimized);
  const dismiss = useUploadProgressStore((s) => s.dismiss);
  const clearCompleted = useUploadProgressStore((s) => s.clearCompleted);

  useEffect(() => {
    if (window.innerWidth < 640) setMinimized(true);
  }, [setMinimized]);

  if (items.length === 0) return null;

  const activeCount = items.filter(
    (it) => it.status === "uploading" || it.status === "finalizing",
  ).length;

  const hasFinished = items.some(
    (it) => it.status === "done" || it.status === "error",
  );

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label={dict.ariaLiveLabel}
      className={cn(
        "fixed z-50 bg-card border rounded-lg shadow-lg",
        "inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-96",
        isMinimized && "sm:w-auto",
      )}
    >
      {isMinimized ? (
        /* Minimized: pill showing active upload count */
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-sm font-medium flex-1">
            {dict.fileCount.replace("{count}", String(activeCount))}
          </span>
          <button
            type="button"
            aria-label={dict.expand}
            onClick={() => setMinimized(false)}
            className="min-h-11 min-w-11 md:min-h-9 md:min-w-9 flex items-center justify-center rounded hover:bg-accent"
          >
            <span aria-hidden="true">&#x25B2;</span>
          </button>
        </div>
      ) : (
        /* Expanded: header + scrollable list */
        <>
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <span className="text-sm font-semibold flex-1">{dict.title}</span>
            {hasFinished && (
              <button
                type="button"
                onClick={clearCompleted}
                className="text-xs text-muted-foreground hover:text-foreground min-h-11 min-w-11 md:min-h-9 md:min-w-9 flex items-center justify-center rounded hover:bg-accent px-2"
              >
                {dict.clearCompleted}
              </button>
            )}
            <button
              type="button"
              aria-label={dict.minimize}
              onClick={() => setMinimized(true)}
              className="min-h-11 min-w-11 md:min-h-9 md:min-w-9 flex items-center justify-center rounded hover:bg-accent"
            >
              <span aria-hidden="true">&#x25BC;</span>
            </button>
          </div>

          <ul
            className="overflow-y-auto max-h-[40dvh] sm:max-h-[60dvh] divide-y"
          >
            {items.map((item) => {
              const statusLabel =
                item.status === "uploading"
                  ? dict.uploading
                  : item.status === "finalizing"
                    ? dict.finalizing
                    : item.status === "done"
                      ? dict.completed
                      : dict.failed;

              return (
                <li key={item.id} className="px-3 py-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm truncate flex-1"
                      title={item.filename}
                    >
                      {item.filename}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {statusLabel}
                    </span>
                    {item.status === "error" && (
                      <button
                        type="button"
                        aria-label={dict.dismiss}
                        onClick={() => dismiss(item.id)}
                        className="min-h-11 min-w-11 md:min-h-9 md:min-w-9 flex items-center justify-center rounded hover:bg-accent text-destructive text-sm"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  <progress
                    value={item.progress}
                    max={100}
                    className="w-full h-1.5 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
                    aria-label={`${item.filename} ${item.progress}%`}
                  >
                    {item.progress}%
                  </progress>
                  {item.error && (
                    <p className="text-xs text-destructive">{item.error}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
