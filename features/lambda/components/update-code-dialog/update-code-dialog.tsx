"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { uploadLambdaCode } from "@/features/lambda/lib/upload";
import { MAX_ZIP_BYTES } from "@/features/lambda/lib/runtimes";
import { t } from "@/features/shared/i18n/interpolate";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  functionName: string;
  dict: AppDict["lambda"]["updateCodeDialog"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateCodeDialog({ functionName, dict, open, onOpenChange }: Props) {
  const router = useRouter();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "finalizing">("idle");
  const busy = phase !== "idle";

  function handleOpenChange(next: boolean) {
    if (!next) {
      setLocalError(null);
      setProgress(0);
      setPhase("idle");
      if (fileRef.current) fileRef.current.value = "";
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setLocalError(dict.selectFile);
      return;
    }
    if (file.size > MAX_ZIP_BYTES) {
      setLocalError(dict.fileTooLarge);
      return;
    }
    setLocalError(null);
    setPhase("uploading");
    setProgress(0);

    const result = await uploadLambdaCode({
      functionName,
      file,
      onProgress: (p) => setProgress(p),
      onFinalizing: () => setPhase("finalizing"),
    });

    if (result.ok) {
      toast.success(dict.successToast);
      handleOpenChange(false);
      router.refresh();
    } else {
      setPhase("idle");
      setProgress(0);
      toast.error(result.error);
      setLocalError(result.error);
    }
  }

  const statusText =
    phase === "finalizing"
      ? dict.finalizing
      : phase === "uploading"
        ? t(dict.uploading, { percent: progress })
        : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="hidden" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={inputId}>{dict.fileLabel}</Label>
            <input
              ref={fileRef}
              id={inputId}
              type="file"
              accept=".zip,application/zip"
              disabled={busy}
              className={cn(
                "w-full min-w-0 text-sm text-muted-foreground file:mr-3 file:inline-flex file:h-8 file:cursor-pointer file:rounded-lg file:border file:border-input file:bg-transparent file:px-2.5 file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:opacity-50",
              )}
            />
            <p className="text-xs text-muted-foreground">{dict.fileHint}</p>
            {localError && <p className="text-xs text-destructive">{localError}</p>}
          </div>
          {busy && (
            <div className="flex flex-col gap-2">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={phase === "finalizing" ? 100 : progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-foreground transition-[width] duration-300"
                  style={{ width: phase === "finalizing" ? "100%" : `${progress}%` }}
                />
              </div>
              {statusText && <p className="text-xs text-muted-foreground">{statusText}</p>}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => handleOpenChange(false)}>
              {dict.cancel}
            </Button>
            <Button type="submit" disabled={busy}>
              {dict.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
