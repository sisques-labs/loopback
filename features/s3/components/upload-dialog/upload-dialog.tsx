"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import { runUploadBatch } from "@/features/s3/lib/run-upload-batch";

type Props = {
  bucket: string;
  dict: AppDict["s3"]["uploadDialog"];
  closeLabel: string;
};

export function UploadDialog({ bucket, dict, closeLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Counter ref prevents flicker when cursor moves over child elements
  const dragCounterRef = useRef(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const files = Array.from(fileRef.current?.files ?? []);
    if (files.length === 0) {
      setError(dict.selectFile);
      return;
    }
    setError(null);
    setOpen(false);
    await runUploadBatch({ bucket, files, dict, onDone: () => router.refresh() });
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) setIsDragging(true);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
          />
        }
      >
        <UploadIcon />
        {dict.trigger}
      </DialogTrigger>
      <DialogContent
        closeLabel={closeLabel}
        className="sm:max-w-lg"
        data-dragging={isDragging || undefined}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" encType="multipart/form-data">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors",
              isDragging
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
            aria-label={dict.dropHere}
          >
            <UploadIcon
              className={cn(
                "size-10 transition-transform duration-150",
                isDragging && "scale-110"
              )}
            />
            <div className="text-center">
              <p className="text-sm font-medium">{dict.dropHere}</p>
              <p className="mt-1 text-xs">{dict.selectMultiple}</p>
            </div>
          </button>

          <input
            id="upload-file"
            type="file"
            ref={fileRef}
            multiple
            className="sr-only"
            aria-invalid={error ? true : undefined}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              {dict.cancel}
            </DialogClose>
            <Button type="submit">{dict.submit}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
