"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { t } from "@/features/shared/i18n/interpolate";
import { uploadFile } from "@/features/s3/lib/upload";
import { useUploadProgressStore } from "@/features/shared/stores/upload-progress-store";

type Props = {
  bucket: string;
  dict: AppDict["s3"]["uploadDialog"];

    closeLabel: string;
};

export function UploadDialog({ bucket, dict, closeLabel}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError(dict.selectFile);
      return;
    }
    setError(null);

    // Register the upload in the store and close the dialog immediately
    const id = useUploadProgressStore.getState().addItem({ bucket, filename: file.name });
    setOpen(false);

    const result = await uploadFile({
      bucket,
      file,
      onProgress: (p) => useUploadProgressStore.getState().updateProgress(id, p),
      onFinalizing: () => useUploadProgressStore.getState().setStatus(id, "finalizing"),
    });

    if (result.ok) {
      useUploadProgressStore.getState().setStatus(id, "done");
      toast.success(t(dict.success, { key: result.key }));
      router.refresh();
    } else {
      useUploadProgressStore.getState().setStatus(id, "error", result.error);
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <UploadIcon />
        {dict.trigger}
      </DialogTrigger>
      <DialogContent closeLabel={closeLabel}>
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
              required
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
