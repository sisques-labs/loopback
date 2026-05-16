import { Sidebar } from "@/features/shared/components/sidebar/sidebar";
import { Header } from "@/features/shared/components/header/header";
import { HeaderBreadcrumb } from "@/features/shared/components/header-breadcrumb/header-breadcrumb";
import { MobileNavTrigger } from "@/features/shared/components/mobile-nav/mobile-nav-trigger";
import { MobileNavDrawer } from "@/features/shared/components/mobile-nav/mobile-nav-drawer";
import { UploadProgressModalMount } from "@/features/s3/components/upload-progress-modal/upload-progress-modal-mount";
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
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar dict={dict.shared.sidebar} localePrefix={localePrefix} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            leftSlot={
              <MobileNavTrigger label={dict.shared.header.openMenu} />
            }
            centerSlot={
              <HeaderBreadcrumb
                locale={locale}
                settingsLabel={dict.shared.sidebar.settings}
              />
            }
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
      <MobileNavDrawer
        sidebarDict={dict.shared.sidebar}
        headerDict={dict.shared.header}
        localePrefix={localePrefix}
      />
      <UploadProgressModalMount dict={dict.s3.uploadProgress} />
    </>
  );
}
