"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { deleteTableAction } from "@/features/dynamodb/use-cases/delete-table/delete-table";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type Props = {
  tableName: string;
  dict: AppDict["dynamodb"]["deleteTableDialog"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  locale: Locale;
};

export function DeleteTableDialog({ tableName, dict, confirmDict, locale }: Props) {
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
        action={deleteTableAction}
        hiddenFields={[
          { name: "tableName", value: tableName },
          { name: "locale", value: locale },
        ]}
        confirmLabel={dict.confirm}
        cancelLabel={dict.cancel}
        confirmingTemplate={confirmDict.confirming}
      />
    </>
  );
}
