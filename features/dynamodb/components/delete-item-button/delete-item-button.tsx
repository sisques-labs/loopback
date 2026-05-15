"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { deleteItemAction } from "@/features/dynamodb/use-cases/delete-item/delete-item";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type Props = {
  tableName: string;
  itemKey: Record<string, unknown>;
  dict: AppDict["dynamodb"]["deleteItemDialog"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  locale: Locale;

    closeLabel: string;
};

export function DeleteItemButton({ tableName, itemKey, dict, confirmDict, locale, closeLabel}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="min-h-11 min-w-11 text-destructive hover:text-destructive md:min-h-9 md:min-w-9"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon className="size-4" />
        <span className="sr-only">{dict.confirm}</span>
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={dict.title}
        description={dict.description}
        action={deleteItemAction}
        hiddenFields={[
          { name: "tableName", value: tableName },
          { name: "keyJson", value: JSON.stringify(itemKey) },
          { name: "locale", value: locale },
        ]}
        confirmLabel={dict.confirm}
        cancelLabel={dict.cancel}
        closeLabel={closeLabel}
        confirmingTemplate={confirmDict.confirming}
      />
    </>
  );
}
