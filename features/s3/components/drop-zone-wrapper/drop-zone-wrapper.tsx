"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import { runUploadBatch } from "@/features/s3/lib/run-upload-batch";

type Props = {
  /** The S3 bucket to upload to. */
  bucket: string;
  /**
   * Key prefix for uploaded objects.
   * Currently inert — uploadFile has no prefix param.
   * Kept for forward-compatibility when prefix targeting is added.
   */
  prefix: string;
  /** Narrowed i18n dict for the uploadDialog section. */
  dict: AppDict["s3"]["uploadDialog"];
  children: React.ReactNode;
};

/**
 * DropZoneWrapper — "use client" component that wraps any content and provides
 * a full-area drag-and-drop upload surface. BucketPage stays a Server Component;
 * only this component carries the client boundary.
 *
 * Drag state is tracked with a counter ref to prevent overlay flicker when the
 * pointer moves across child elements (dragLeave fires on child exit before
 * dragEnter fires on the parent again).
 */
export function DropZoneWrapper({ bucket, dict, children }: Props) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  // Counter ref: increment on dragEnter, decrement on dragLeave.
  // Overlay only shows when counter > 0 and hides when counter reaches 0.
  const dragCounterRef = useRef(0);

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await runUploadBatch({ bucket, files, dict, onDone: () => router.refresh() });
  }

  return (
    <div
      data-testid="drop-zone-wrapper"
      className="relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div
          data-testid="drop-zone-overlay"
          className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-primary">{dict.dropHere}</p>
        </div>
      )}
      {children}
    </div>
  );
}
