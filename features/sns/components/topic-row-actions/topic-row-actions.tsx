"use client";

import { useState } from "react";
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { deleteTopicAction } from "@/features/sns/use-cases/delete-topic/delete-topic";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import { t } from "@/features/shared/i18n/interpolate";

type Props = {
  topicArn: string;
  topicName: string;
  dict: AppDict["sns"]["topicRowActions"];
  confirmDict: AppDict["shared"]["confirmDialog"];
};

export function TopicRowActions({ topicArn, topicName, dict, confirmDict }: Props) {
  const [open, setOpen] = useState(false);

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
          <DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}>
            <Trash2Icon />
            {dict.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={dict.deleteTitle}
        description={t(dict.deleteConfirm, { topic: topicName })}
        action={deleteTopicAction}
        hiddenFields={[{ name: "topicArn", value: topicArn }]}
        confirmLabel={dict.delete}
        cancelLabel={confirmDict.cancel}
        confirmingTemplate={confirmDict.confirming}
      />
    </>
  );
}
