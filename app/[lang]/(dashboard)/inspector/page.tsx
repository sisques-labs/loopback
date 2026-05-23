import type { Metadata } from "next";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getEntries } from "@/lib/aws/inspector-buffer";
import { InspectorClient } from "@/features/inspector/components/inspector-client/inspector-client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: dict.inspector.title,
  };
}

export default async function InspectorPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  // Read directly from buffer on RSC — no SDK call needed.
  const initialEntries = [...getEntries()].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-semibold">{dict.inspector.title}</h1>
          <p className="text-sm text-muted-foreground">{dict.inspector.description}</p>
        </div>
      </div>
      <InspectorClient
        initialEntries={initialEntries}
        dict={{
          toolbar: dict.inspector.toolbar,
          empty: dict.inspector.empty,
          card: dict.inspector.card,
          detail: dict.inspector.detail,
        }}
      />
    </div>
  );
}
