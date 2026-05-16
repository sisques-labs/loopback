"use client";

import { useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { classifyContentType, type PreviewCategory } from "@/features/s3/components/object-preview-dialog/classify-content-type";
import { TEXT_PREVIEW_MAX_BYTES } from "@/features/s3/components/object-preview-dialog/constants";
import type { S3Object } from "@/features/s3/types/s3";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

export { TEXT_PREVIEW_MAX_BYTES };

type PreviewState = "idle" | "loading" | "loaded" | "tooLarge" | "unsupported" | "error";

type Props = {
  open: boolean;
  onClose: () => void;
  object: S3Object;
  bucket: string;
  dict: AppDict["s3"]["previewDialog"];
  closeLabel: string;
};

function ObjectPreviewDialogInner({
  open,
  onClose,
  object,
  bucket,
  dict,
  closeLabel,
}: Props) {
  const [previewState, setPreviewState] = useState<PreviewState>("idle");
  const [category, setCategory] = useState<PreviewCategory | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  const proxyUrl = `/api/aws/s3/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(object.key)}`;
  const downloadHref = `${proxyUrl}?download=1`;

  useEffect(() => {
    if (!open) return;

    fetch(proxyUrl, {
      headers: { Range: `bytes=0-${TEXT_PREVIEW_MAX_BYTES - 1}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          setPreviewState("error");
          return;
        }

        const contentTypeHeader = res.headers.get("content-type") ?? undefined;
        const resolved = classifyContentType(contentTypeHeader, object.key);
        setCategory(resolved);

        if (resolved === "image") {
          setPreviewState("loaded");
          return;
        }

        if (resolved === "text") {
          const contentLengthHeader = res.headers.get("content-length");
          const contentLength = contentLengthHeader
            ? parseInt(contentLengthHeader, 10)
            : null;

          if (contentLength !== null && contentLength > TEXT_PREVIEW_MAX_BYTES) {
            setPreviewState("tooLarge");
            return;
          }

          const text = await res.text();
          if (text.length > TEXT_PREVIEW_MAX_BYTES) {
            setPreviewState("tooLarge");
            return;
          }

          setTextContent(text);
          setPreviewState("loaded");
          return;
        }

        // unsupported
        setPreviewState("unsupported");
      })
      .catch(() => {
        setPreviewState("error");
      });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl" closeLabel={closeLabel}>
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {previewState === "idle" || previewState === "loading" ? (
            <p className="text-muted-foreground text-sm">{dict.loading}</p>
          ) : previewState === "error" ? (
            <p className="text-destructive text-sm">{dict.error}</p>
          ) : previewState === "tooLarge" ? (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">{dict.tooLarge}</p>
              <a href={downloadHref} download>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {dict.downloadInstead}
                </Button>
              </a>
            </div>
          ) : previewState === "unsupported" ? (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">{dict.unsupported}</p>
              <a href={downloadHref} download>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {dict.downloadInstead}
                </Button>
              </a>
            </div>
          ) : previewState === "loaded" && category === "image" ? (
            <img
              src={proxyUrl}
              alt={object.key}
              className="max-h-[60vh] w-full rounded object-contain"
            />
          ) : previewState === "loaded" && category === "text" ? (
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded bg-muted p-4 text-xs">
              {textContent}
            </pre>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ObjectPreviewDialog(props: Props) {
  return <ObjectPreviewDialogInner key={`${props.object.key}-${props.open}`} {...props} />;
}
