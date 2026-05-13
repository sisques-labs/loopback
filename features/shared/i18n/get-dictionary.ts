import enShared from "./en";
import esShared from "./es";
import enS3 from "@/features/s3/i18n/en";
import esS3 from "@/features/s3/i18n/es";
import type { Locale } from "./locale";
import type { WidenStringLiterals } from "./widen-literals";

export type AppDict = {
  shared: WidenStringLiterals<typeof enShared>;
  s3: WidenStringLiterals<typeof enS3>;
};

const dictionaries: Record<Locale, AppDict> = {
  en: { shared: enShared, s3: enS3 },
  es: { shared: esShared, s3: esS3 },
};

export function getDictionary(locale: Locale): AppDict {
  return dictionaries[locale];
}
