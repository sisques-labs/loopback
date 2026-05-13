import { Sidebar } from "@/features/shared/components/sidebar/sidebar";
import { Header } from "@/features/shared/components/header/header";
import { LocaleSwitcher } from "@/features/shared/components/locale-switcher/locale-switcher";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar dict={dict.shared.sidebar} localePrefix={localePrefix} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          dict={dict.shared.header}
          rightSlot={<LocaleSwitcher currentLocale={locale} dict={dict.shared.localeSwitcher} />}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
