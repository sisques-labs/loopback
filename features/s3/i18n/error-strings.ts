import enS3 from "./en";
import esS3 from "./es";
import { type Locale, DEFAULT_LOCALE, isLocale } from "@/features/shared/i18n/locale";

const errorDicts = {
  en: enS3.errors,
  es: esS3.errors,
} as const;

export type ErrorStrings = (typeof errorDicts)[Locale];

export function getErrorStrings(maybeLocale: string | undefined): ErrorStrings {
  const locale: Locale = maybeLocale && isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
  return errorDicts[locale];
}
