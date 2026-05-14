"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontalIcon, Trash2Icon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { deleteQueueAction } from "@/features/sqs/use-cases/delete-queue/delete-queue";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import { t } from "@/features/shared/i18n/interpolate";
import { encodeQueueUrlForRoute } from "@/features/sqs/lib/encode-queue-url-param";

type Props = {
  queueUrl: string;
  queueName: string;
  dict: AppDict["sqs"]["queueRowActions"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  localePrefix: string;
  locale: Locale;
};

export function QueueRowActions({
  queueUrl,
  queueName,
  dict,
  confirmDict,
  localePrefix,
  locale,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const encoded = encodeQueueUrlForRoute(queueUrl);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0 md:min-h-9 md:min-w-9"
              aria-label={dict.actions}
            />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`${localePrefix}/sqs/${encoded}`} />}
          >
            <EyeIcon />
            {dict.viewDetail}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2Icon />
            {dict.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={dict.deleteTitle}
        description={t(dict.deleteConfirm, { queue: queueName })}
        action={deleteQueueAction}
        hiddenFields={[{ name: "queueUrl", value: queueUrl }, { name: "locale", value: locale }]}
        confirmLabel={dict.delete}
        cancelLabel={confirmDict.cancel}
        confirmingTemplate={confirmDict.confirming}
      />
    </>
  );
}
