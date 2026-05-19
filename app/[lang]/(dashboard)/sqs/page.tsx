import { SQSListShell } from "@/features/sqs/components/sqs-list-shell/sqs-list-shell";
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

  const shellDict = {
    queueTable: sqs.queueTable,
    queueRowActions: sqs.queueRowActions,
    confirmDialog: shared.confirmDialog,
    page: sqs.page,
    dialog: shared.dialog,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-xl font-semibold wrap-break-word">{sqs.page.title}</h1>
        <CreateQueueDialog dict={sqs.createQueueDialog} locale={locale} closeLabel={shared.dialog.close} />
      </div>
      <SQSListShell initialItems={queues} dict={shellDict} localePrefix={localePrefix} locale={locale} />
    </div>
  );
}
