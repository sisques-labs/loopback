"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/features/shared/i18n/locale";
import { SUPPORTED_LOCALES } from "@/features/shared/i18n/locale";
import { NEXT_LOCALE_COOKIE } from "@/features/shared/i18n/locale-cookie";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type Dict = AppDict["shared"]["localeSwitcher"];

type Props = {
  currentLocale: Locale;
  dict: Dict;
};

export function LocaleSwitcher({ currentLocale, dict }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const locale = e.target.value as Locale;
    if (!SUPPORTED_LOCALES.includes(locale)) return;

    document.cookie = `${NEXT_LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;

    const segments = pathname.split("/");
    if (segments[1] && SUPPORTED_LOCALES.includes(segments[1] as Locale)) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }

    const nextPath = segments.join("/") || "/";
    router.push(nextPath);
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{dict.label}</span>
      <select
        value={currentLocale}
        onChange={onChange}
        className={cn(
          "h-7 rounded-md border border-border bg-background px-2 text-xs",
          "text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
        aria-label={dict.label}
      >
        <option value="en">{dict.en}</option>
        <option value="es">{dict.es}</option>
      </select>
    </label>
  );
}
