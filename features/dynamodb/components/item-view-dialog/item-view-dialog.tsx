"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { JsonViewer } from "@/features/shared/components/json-viewer/json-viewer";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Record<string, unknown>;
  dict: AppDict["dynamodb"]["itemViewDialog"];
  copyButtonDict: AppDict["shared"]["copyButton"];
  closeLabel: string;
};

export function ItemViewDialog({ open, onOpenChange, item, dict, copyButtonDict, closeLabel}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={closeLabel} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <JsonViewer
          value={item}
          maxHeight="60vh"
          copyLabel={copyButtonDict.copyJson}
          copiedLabel={copyButtonDict.copyJsonCopied}
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" type="button" />}>
            {dict.close}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
