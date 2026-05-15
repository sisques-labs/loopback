"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/features/shared/components/confirm-dialog/confirm-dialog";
import { unsubscribeAction } from "@/features/sns/use-cases/unsubscribe/unsubscribe";
import type { Subscription } from "@/features/sns/types/sns";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";
import { t } from "@/features/shared/i18n/interpolate";

type Props = {
  subscriptions: Subscription[];
  topicName: string;
  dict: AppDict["sns"]["subscriptionTable"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  locale: Locale;
};

function SubscriptionRow({
  subscription,
  topicName,
  dict,
  confirmDict,
  locale,
}: {
  subscription: Subscription;
  topicName: string;
  dict: Props["dict"];
  confirmDict: Props["confirmDict"];
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const isPending = subscription.subscriptionArn === "PendingConfirmation";

  return (
    <>
      <TableRow>
        <TableCell>{subscription.protocol}</TableCell>
        <TableCell className="hidden max-w-[16rem] truncate sm:table-cell">
          {subscription.endpoint}
        </TableCell>
        <TableCell>
          {isPending ? (
            <Badge variant="outline">{dict.statusPending}</Badge>
          ) : (
            <Badge variant="secondary">{dict.statusConfirmed}</Badge>
          )}
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon-sm"
            className="min-h-11 min-w-11 shrink-0 md:min-h-9 md:min-w-9"
            aria-label={dict.unsubscribe}
            disabled={isPending}
            onClick={() => setOpen(true)}
          >
            <Trash2Icon />
          </Button>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={dict.unsubscribeTitle}
        description={t(dict.unsubscribeConfirm, {
          endpoint: subscription.endpoint,
          topic: topicName,
        })}
        action={unsubscribeAction}
        hiddenFields={[{ name: "subscriptionArn", value: subscription.subscriptionArn }, { name: "locale", value: locale }]}
        confirmLabel={dict.unsubscribe}
        cancelLabel={confirmDict.cancel}
        confirmingTemplate={confirmDict.confirming}
      />
    </>
  );
}

export function SubscriptionTable({ subscriptions, topicName, dict, confirmDict, locale }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dict.protocol}</TableHead>
          <TableHead className="hidden sm:table-cell">{dict.endpoint}</TableHead>
          <TableHead>{dict.status}</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((sub) => (
          <SubscriptionRow
            key={sub.subscriptionArn}
            subscription={sub}
            topicName={topicName}
            dict={dict}
            confirmDict={confirmDict}
            locale={locale}
          />
        ))}
      </TableBody>
    </Table>
  );
}
