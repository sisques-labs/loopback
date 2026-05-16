import enDashboard from "./en";
import esDashboard from "./es";
import { type Locale, DEFAULT_LOCALE, isLocale } from "@/features/shared/i18n/locale";

const errorDicts = {
  en: enDashboard.errors,
  es: esDashboard.errors,
} as const;

export type DashboardErrorStrings = (typeof errorDicts)[Locale];

export function getDashboardErrorStrings(
  maybeLocale: string | undefined,
): DashboardErrorStrings {
  const locale: Locale =
    maybeLocale && isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
  return errorDicts[locale];
}
