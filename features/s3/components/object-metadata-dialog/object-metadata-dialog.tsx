"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes } from "@/features/shared/utils/format-bytes/format-bytes";
import type { S3Object } from "@/features/s3/types/s3";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type MetadataState = "idle" | "loading" | "loaded" | "error";

type Props = {
  open: boolean;
  onClose: () => void;
  bucket: string;
  objectKey: string;
  dict: AppDict["s3"]["metadataDialog"];
  closeLabel: string;
};

function ObjectMetadataDialogInner({
  open,
  onClose,
  bucket,
  objectKey,
  dict,
  closeLabel,
}: Props) {
  const [metadataState, setMetadataState] = useState<MetadataState>("idle");
  const [object, setObject] = useState<S3Object | null>(null);

  useEffect(() => {
    if (!open) return;

    fetch(
      `/api/aws/s3/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(objectKey)}/metadata`,
    )
      .then(async (res) => {
        if (!res.ok) {
          setMetadataState("error");
          return;
        }
        const body = await res.json();
        setObject(body.data as S3Object);
        setMetadataState("loaded");
      })
      .catch(() => {
        setMetadataState("error");
      });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasCustomMetadata =
    object?.metadata !== undefined && Object.keys(object.metadata).length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg" closeLabel={closeLabel}>
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {metadataState === "idle" || metadataState === "loading" ? (
            <p className="text-muted-foreground text-sm">{dict.loading}</p>
          ) : metadataState === "error" ? (
            <p className="text-destructive text-sm">{dict.error}</p>
          ) : metadataState === "loaded" && object ? (
            <div className="flex flex-col gap-4">
              <dl className="flex flex-col gap-2 sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-4 sm:gap-y-2">
                <dt className="text-muted-foreground text-sm">{dict.size}</dt>
                <dd className="text-sm">{formatBytes(object.size)}</dd>

                <dt className="text-muted-foreground text-sm">{dict.contentType}</dt>
                <dd className="text-sm">{object.contentType ?? dict.notAvailable}</dd>

                <dt className="text-muted-foreground text-sm">{dict.etag}</dt>
                <dd className="break-all font-mono text-xs">{object.etag ?? dict.notAvailable}</dd>

                <dt className="text-muted-foreground text-sm">{dict.storageClass}</dt>
                <dd className="text-sm">{object.storageClass ?? dict.notAvailable}</dd>

                <dt className="text-muted-foreground text-sm">{dict.lastModified}</dt>
                <dd className="text-sm">{new Date(object.lastModified).toLocaleString()}</dd>
              </dl>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">{dict.customSection}</h3>
                {hasCustomMetadata ? (
                  <dl className="flex flex-col gap-1 sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-4 sm:gap-y-1">
                    {Object.entries(object.metadata!).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-muted-foreground break-words font-mono text-xs">
                          {k}
                        </dt>
                        <dd className="select-text break-words font-mono text-xs">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-muted-foreground text-sm">{dict.noCustom}</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ObjectMetadataDialog(props: Props) {
  return (
    <ObjectMetadataDialogInner
      key={`${props.objectKey}-${props.open}`}
      {...props}
    />
  );
}
