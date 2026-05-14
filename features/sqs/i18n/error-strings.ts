import enSQS from "./en";
import esSQS from "./es";
import { type Locale, DEFAULT_LOCALE, isLocale } from "@/features/shared/i18n/locale";

const errorDicts = {
  en: enSQS.errors,
  es: esSQS.errors,
} as const;

export type SqsErrorStrings = (typeof errorDicts)[Locale];

export function getSqsErrorStrings(maybeLocale: string | undefined): SqsErrorStrings {
  const locale: Locale = maybeLocale && isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
  return errorDicts[locale];
}
