import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getQueueAttributes } from "@/features/sqs/services/get-queue-attributes/get-queue-attributes";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { decodeQueueUrlParam, isLikelyQueueServiceUrl } from "@/features/sqs/lib/decode-queue-url-param";
import { queueNameFromUrl } from "@/features/sqs/lib/queue-url-display";
import { QueueAttributesCard } from "@/features/sqs/components/queue-attributes-card/queue-attributes-card";
import { QueueDetailMessaging } from "@/features/sqs/components/queue-detail-messaging/queue-detail-messaging";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string; queueKey: string }>;
};

export default async function QueueDetailPage({ params }: Props) {
  const { lang, queueKey: queueKeyParam } = await params;
  const queueUrl = decodeQueueUrlParam(queueKeyParam);

  if (!isLikelyQueueServiceUrl(queueUrl)) {
    notFound();
  }

  const attributes = await getQueueAttributes(queueUrl);

  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const d = dict.sqs.queueDetail;
  const localePrefix = `/${locale}`;
  const displayName = queueNameFromUrl(queueUrl);
  const isFifo =
    attributes.FifoQueue === "true" || displayName.endsWith(".fifo");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`${localePrefix}/sqs`}
          className="inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground md:min-h-9 md:min-w-9"
        >
          <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
          {d.back}
        </Link>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold wrap-break-word">{displayName}</h1>
          <p className="mt-1 min-w-0 wrap-break-word text-sm text-muted-foreground">
            <span className="font-medium">{d.urlLabel}:</span>{" "}
            <span className="font-mono text-xs sm:text-sm">{queueUrl}</span>
          </p>
        </div>
        <Badge variant={isFifo ? "default" : "secondary"} className="shrink-0">
          {isFifo ? d.typeFifo : d.typeStandard}
        </Badge>
      </div>

      <QueueAttributesCard attributes={attributes} dict={d} />

      <QueueDetailMessaging
        queueUrl={queueUrl}
        queueName={displayName}
        isFifo={isFifo}
        dict={d}
        confirmDict={dict.shared.confirmDialog}
      />
    </div>
  );
}
