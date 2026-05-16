import type { Metadata } from "next";
import { TerminalPanel } from "@/features/terminal";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { PageNotice } from "@/features/shared/components/page-notice/page-notice";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: dict.terminal.title,
  };
}

export default async function TerminalPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="text-xl font-semibold">{dict.terminal.title}</h1>
      <PageNotice variant="warning">
        {dict.terminal.underConstruction}
      </PageNotice>
      <div className="min-h-0 flex-1">
        <TerminalPanel />
      </div>
    </div>
  );
}
