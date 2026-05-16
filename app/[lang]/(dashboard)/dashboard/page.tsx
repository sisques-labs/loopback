import { ConnectionStatus } from "@/features/dashboard/components/connection-status/connection-status";
import { ServiceGrid } from "@/features/dashboard/components/service-grid/service-grid";
import { getEndpointHealth } from "@/features/dashboard/lib/health";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const dashboard = dict.dashboard;
  const localePrefix = `/${locale}`;

  const health = await getEndpointHealth();

  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold break-words">{dashboard.page.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dashboard.page.subtitle}
        </p>
      </div>

      <ConnectionStatus health={health} dict={dashboard.connection} />

      <ServiceGrid
        localePrefix={localePrefix}
        comingSoonLabel={dashboard.services.comingSoon}
      />
    </div>
  );
}
