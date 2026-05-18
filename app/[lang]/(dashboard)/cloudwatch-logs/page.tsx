import type { Metadata } from "next";
import { LogViewerShell } from "@/features/logs/components/log-viewer-shell/log-viewer-shell";
import { listLogGroups } from "@/features/logs/services/list-log-groups/list-log-groups";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
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
    title: dict.logs.title,
  };
}

export default async function CloudWatchLogsPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  // Fetch available log groups server-side for the service filter dropdown.
  // On connection failure, fall back to an empty list — the client will still poll.
  let services: string[] = [];
  try {
    services = await listLogGroups();
  } catch {
    // Endpoint unavailable — the shell handles error state via polling status
  }

  return (
    <div className="flex h-full flex-col">
      <LogViewerShell dict={dict.logs} services={services} />
    </div>
  );
}
