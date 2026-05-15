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
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Record<string, unknown>;
  dict: AppDict["dynamodb"]["itemViewDialog"];

    closeLabel: string;
};

export function ItemViewDialog({ open, onOpenChange, item, dict, closeLabel}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={closeLabel} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto rounded-md border bg-muted/40 p-3">
          <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" type="button" />}>
            {dict.close}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
