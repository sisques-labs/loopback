import enLambda from "./en";
import esLambda from "./es";
import { type Locale, DEFAULT_LOCALE, isLocale } from "@/features/shared/i18n/locale";

const errorDicts = {
  en: enLambda.errors,
  es: esLambda.errors,
} as const;

export type LambdaErrorStrings = (typeof errorDicts)[Locale];

export function getLambdaErrorStrings(maybeLocale: string | undefined): LambdaErrorStrings {
  const locale: Locale = maybeLocale && isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
  return errorDicts[locale];
}
