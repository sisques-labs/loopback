"use client";

import { SendMessageDialog } from "@/features/sqs/components/send-message-dialog/send-message-dialog";
import { ReceiveMessagesSection } from "@/features/sqs/components/receive-messages-section/receive-messages-section";
import { PurgeQueueDialog } from "@/features/sqs/components/purge-queue-dialog/purge-queue-dialog";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  queueUrl: string;
  queueName: string;
  isFifo: boolean;
  dict: AppDict["sqs"]["queueDetail"];
  confirmDict: AppDict["shared"]["confirmDialog"];
};

export function QueueDetailMessaging({ queueUrl, queueName, isFifo, dict, confirmDict }: Props) {
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
          />
          <PurgeQueueDialog
            queueUrl={queueUrl}
            queueName={queueName}
            dict={dict.purge}
            confirmDict={confirmDict}
          />
        </div>
      </div>
      <ReceiveMessagesSection queueUrl={queueUrl} dict={dict.receive} />
    </div>
  );
}
