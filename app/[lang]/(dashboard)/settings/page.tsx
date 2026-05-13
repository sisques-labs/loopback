import type { ReactNode } from "react";
import { LocaleSwitcher } from "@/features/shared/components/locale-switcher/locale-switcher";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { cn } from "@/lib/utils";

function EndpointValue({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        "block max-w-full overflow-x-auto rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs",
        className,
      )}
    >
      {children}
    </code>
  );
}

export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const s = dict.shared.settings;

  const serverEndpoint = process.env.AWS_ENDPOINT_URL?.trim() ?? "";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>

      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">{s.languageTitle}</h2>
        <LocaleSwitcher
          currentLocale={locale}
          dict={dict.shared.localeSwitcher}
          hideLabel
        />
      </section>

      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">{s.endpointTitle}</h2>
        {serverEndpoint ? (
          <EndpointValue>{serverEndpoint}</EndpointValue>
        ) : (
          <p className="text-sm text-muted-foreground">{s.notSet}</p>
        )}
      </section>
    </div>
  );
}
