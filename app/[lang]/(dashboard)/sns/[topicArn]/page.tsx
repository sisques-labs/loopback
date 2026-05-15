import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { getTopicAttributes } from "@/features/sns/services/get-topic-attributes/get-topic-attributes";
import { listSubscriptionsByTopic } from "@/features/sns/services/list-subscriptions/list-subscriptions";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { Badge } from "@/components/ui/badge";
import { SubscribeDialog } from "@/features/sns/components/subscribe-dialog/subscribe-dialog";
import { SubscriptionTable } from "@/features/sns/components/subscription-table/subscription-table";
import { PublishDialog } from "@/features/sns/components/publish-dialog/publish-dialog";
import { decodeTopicArnParam } from "@/features/sns/lib/decode-topic-arn-param";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string; topicArn: string }>;
};

export default async function TopicDetailPage({ params }: Props) {
  const { lang, topicArn: topicArnParam } = await params;
  const topicArn = decodeTopicArnParam(topicArnParam);
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const d = dict.sns.topicDetail;
  const localePrefix = `/${locale}`;

  const [attrs, subscriptions] = await Promise.all([
    getTopicAttributes(topicArn),
    listSubscriptionsByTopic(topicArn),
  ]);

  const topicName = topicArn.split(":").pop() ?? topicArn;
  const isFifo = topicName.endsWith(".fifo");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`${localePrefix}/sns`}
          className="inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground md:min-h-9 md:min-w-9"
        >
          <ArrowLeftIcon className="size-4" />
          {d.back}
        </Link>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold break-words">{topicName}</h1>
          <p className="mt-1 min-w-0 truncate text-sm text-muted-foreground sm:overflow-visible sm:whitespace-normal">
            <span className="font-medium">{d.arnLabel}:</span> {topicArn}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PublishDialog
            topicArn={topicArn}
            topicName={topicName}
            dict={dict.sns.publishDialog}
            locale={locale}
           closeLabel={shared.dialog.close}/>
          <Badge variant={isFifo ? "default" : "secondary"}>
            {isFifo ? d.typeFifo : d.typeStandard}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{d.subscriptionsConfirmed}</p>
          <p className="mt-1 text-2xl font-semibold">{attrs.SubscriptionsConfirmed ?? "0"}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{d.subscriptionsPending}</p>
          <p className="mt-1 text-2xl font-semibold">{attrs.SubscriptionsPending ?? "0"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SubscribeDialog
            topicArn={topicArn}
            isFifo={isFifo}
            dict={dict.sns.subscribeDialog}
            locale={locale}
           closeLabel={shared.dialog.close}/>
        </div>
        {subscriptions.length > 0 ? (
          <SubscriptionTable
            subscriptions={subscriptions}
            topicName={topicName}
            dict={dict.sns.subscriptionTable}
            confirmDict={dict.shared.confirmDialog}
            closeLabel={shared.dialog.close}
            locale={locale}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{d.empty}</p>
        )}
      </div>
    </div>
  );
}
