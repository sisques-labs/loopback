"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const fileRef = useRef<HTMLInputElement>(null);
  // Counter ref for nested drag tracking (prevents flickering on child elements)
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
    if (dragCounterRef.current === 1) {
      (e.currentTarget as HTMLElement).setAttribute("data-dragging", "true");
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
      (e.currentTarget as HTMLElement).removeAttribute("data-dragging");
    }
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    (e.currentTarget as HTMLElement).removeAttribute("data-dragging");

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
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" encType="multipart/form-data">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="upload-file">{dict.fileLabel}</Label>
            <Input
              id="upload-file"
              type="file"
              ref={fileRef}
              multiple
              aria-invalid={error ? true : undefined}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              {dict.cancel}
            </DialogClose>
            <Button type="submit">
              {dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
