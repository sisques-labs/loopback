"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontalIcon, Trash2Icon, EyeIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { deleteTopicAction } from "@/features/sns/use-cases/delete-topic/delete-topic";
import { PublishDialog } from "@/features/sns/components/publish-dialog/publish-dialog";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import { t } from "@/features/shared/i18n/interpolate";

type Props = {
  topicArn: string;
  topicName: string;
  dict: AppDict["sns"]["topicRowActions"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  publishDict: AppDict["sns"]["publishDialog"];
  localePrefix: string;
};

export function TopicRowActions({ topicArn, topicName, dict, confirmDict, publishDict, localePrefix }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

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
            render={
              <Link href={`${localePrefix}/sns/${encodeURIComponent(topicArn)}`} />
            }
          >
            <EyeIcon />
            {dict.viewDetail}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setPublishOpen(true)}>
            <SendIcon />
            {dict.publish}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2Icon />
            {dict.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PublishDialog
        topicArn={topicArn}
        topicName={topicName}
        dict={publishDict}
        open={publishOpen}
        onOpenChange={setPublishOpen}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
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
