import { QueueTable } from "@/features/sqs/components/queue-table/queue-table";
import { CreateQueueDialog } from "@/features/sqs/components/create-queue-dialog/create-queue-dialog";
import { listQueues } from "@/features/sqs/services/list-queues/list-queues";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

/** SQS is only available at runtime; prerender would call AWS during `next build`. */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function SQSPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const sqs = dict.sqs;
  const shared = dict.shared;
  const localePrefix = `/${locale}`;
  const queues = await listQueues();

  if (queues.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold wrap-break-word">{sqs.page.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{sqs.page.empty}</p>
          </div>
          <CreateQueueDialog dict={sqs.createQueueDialog} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-xl font-semibold wrap-break-word">{sqs.page.title}</h1>
        <CreateQueueDialog dict={sqs.createQueueDialog} />
      </div>
      <QueueTable
        queues={queues}
        dict={sqs.queueTable}
        rowActionsDict={sqs.queueRowActions}
        confirmDict={shared.confirmDialog}
        localePrefix={localePrefix}
      />
    </div>
  );
}
