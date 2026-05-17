"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SqsMessageAttribute } from "@/features/sqs/use-cases/receive-messages/receive-messages";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  open: boolean;
  onClose: () => void;
  attributes?: Record<string, string>;
  messageAttributes?: Record<string, SqsMessageAttribute>;
  dict: AppDict["sqs"]["queueDetail"]["receive"]["attributesDialog"];
  closeLabel: string;
};

function MessageAttributesDialogInner({
  open,
  onClose,
  attributes,
  messageAttributes,
  dict,
  closeLabel,
}: Props) {
  const hasSystem = attributes && Object.keys(attributes).length > 0;
  const hasCustom = messageAttributes && Object.keys(messageAttributes).length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg" closeLabel={closeLabel}>
        <DialogHeader>
          <DialogTitle>{dict.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          {hasSystem && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">{dict.systemSection}</h3>
              <dl className="flex flex-col gap-1 sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-4 sm:gap-y-1">
                {Object.entries(attributes!).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground break-words font-mono text-xs">{k}</dt>
                    <dd className="font-mono text-xs break-words">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {hasCustom && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">{dict.customSection}</h3>
              <dl className="flex flex-col gap-1 sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-4 sm:gap-y-1">
                {Object.entries(messageAttributes!).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground break-words font-mono text-xs">{k}</dt>
                    <dd className="font-mono text-xs break-words">
                      {v.value}{" "}
                      <span className="text-muted-foreground">({v.dataType})</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MessageAttributesDialog(props: Props) {
  return <MessageAttributesDialogInner key={String(props.open)} {...props} />;
}
