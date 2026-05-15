import enDynamoDB from "./en";
import esDynamoDB from "./es";
import { type Locale, DEFAULT_LOCALE, isLocale } from "@/features/shared/i18n/locale";

const errorDicts = {
  en: enDynamoDB.errors,
  es: esDynamoDB.errors,
} as const;

export type DynamoDBErrorStrings = (typeof errorDicts)[Locale];

export function getDynamoDBErrorStrings(maybeLocale: string | undefined): DynamoDBErrorStrings {
  const locale: Locale = maybeLocale && isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
  return errorDicts[locale];
}
