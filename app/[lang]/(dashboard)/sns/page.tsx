import { SNSListShell } from "@/features/sns/components/sns-list-shell/sns-list-shell";
import { CreateTopicDialog } from "@/features/sns/components/create-topic-dialog/create-topic-dialog";
import { listTopics } from "@/features/sns/services/list-topics/list-topics";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

/** SNS is only available at runtime; prerender would call AWS during `next build`. */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function SNSPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const sns = dict.sns;
  const shared = dict.shared;
  const localePrefix = `/${locale}`;
  const topics = await listTopics();

  const shellDict = {
    topicTable: sns.topicTable,
    topicRowActions: sns.topicRowActions,
    confirmDialog: shared.confirmDialog,
    publishDialog: sns.publishDialog,
    copyButton: shared.copyButton,
    page: sns.page,
    dialog: shared.dialog,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-xl font-semibold break-words">{sns.page.title}</h1>
        <CreateTopicDialog dict={sns.createTopicDialog} locale={locale} closeLabel={shared.dialog.close} />
      </div>
      <SNSListShell
        initialItems={topics}
        dict={shellDict}
        localePrefix={localePrefix}
        locale={locale}
      />
    </div>
  );
}
