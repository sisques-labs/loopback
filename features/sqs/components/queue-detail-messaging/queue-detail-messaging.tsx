"use client";

import { SendMessageDialog } from "@/features/sqs/components/send-message-dialog/send-message-dialog";
import { ReceiveMessagesSection } from "@/features/sqs/components/receive-messages-section/receive-messages-section";
import { PurgeQueueDialog } from "@/features/sqs/components/purge-queue-dialog/purge-queue-dialog";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type Props = {
  queueUrl: string;
  queueName: string;
  isFifo: boolean;
  dict: AppDict["sqs"]["queueDetail"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  locale: Locale;

    closeLabel: string;
};

export function QueueDetailMessaging({ queueUrl, queueName, isFifo, dict, confirmDict, locale, closeLabel}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{dict.messagingTitle}</h2>
        <div className="flex flex-wrap gap-2">
          <SendMessageDialog
            queueUrl={queueUrl}
            queueName={queueName}
            isFifo={isFifo}
            dict={dict.sendMessage}
            locale={locale}
           closeLabel={closeLabel}/>
          <PurgeQueueDialog
            queueUrl={queueUrl}
            queueName={queueName}
            dict={dict.purge}
            confirmDict={confirmDict}
            locale={locale}
           closeLabel={closeLabel}/>
        </div>
      </div>
      <ReceiveMessagesSection queueUrl={queueUrl} dict={dict.receive} locale={locale} />
    </div>
  );
}
