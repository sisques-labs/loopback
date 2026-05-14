import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { decodeQueueUrlParam, isLikelyQueueServiceUrl } from "@/features/sqs/lib/decode-queue-url-param";
import { queueNameFromUrl } from "@/features/sqs/lib/queue-url-display";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string; queueKey: string }>;
};

/**
 * Slice 1 placeholder: validates the route codec only. Full GetQueueAttributes
 * detail ships in Slice 3 (PR3).
 */
export default async function QueueDetailStubPage({ params }: Props) {
  const { lang, queueKey: queueKeyParam } = await params;
  const queueUrl = decodeQueueUrlParam(queueKeyParam);

  if (!isLikelyQueueServiceUrl(queueUrl)) {
    notFound();
  }

  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const d = dict.sqs.queueDetailStub;
  const localePrefix = `/${locale}`;
  const displayName = queueNameFromUrl(queueUrl);

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
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold wrap-break-word">{d.title}: {displayName}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{d.description}</p>
        <div className="mt-2 rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">{d.urlLabel}</p>
          <p className="mt-1 break-all font-mono text-sm">{queueUrl}</p>
        </div>
      </div>
    </div>
  );
}
