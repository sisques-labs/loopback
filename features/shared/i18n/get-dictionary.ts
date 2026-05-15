import enShared from "./en";
import esShared from "./es";
import enS3 from "@/features/s3/i18n/en";
import esS3 from "@/features/s3/i18n/es";
import enSNS from "@/features/sns/i18n/en";
import esSNS from "@/features/sns/i18n/es";
import enSQS from "@/features/sqs/i18n/en";
import esSQS from "@/features/sqs/i18n/es";
import enLambda from "@/features/lambda/i18n/en";
import esLambda from "@/features/lambda/i18n/es";
import enDynamoDB from "@/features/dynamodb/i18n/en";
import esDynamoDB from "@/features/dynamodb/i18n/es";
import type { Locale } from "./locale";
import type { WidenStringLiterals } from "./widen-literals";

export type AppDict = {
  shared: WidenStringLiterals<typeof enShared>;
  s3: WidenStringLiterals<typeof enS3>;
  sns: WidenStringLiterals<typeof enSNS>;
  sqs: WidenStringLiterals<typeof enSQS>;
  lambda: WidenStringLiterals<typeof enLambda>;
  dynamodb: WidenStringLiterals<typeof enDynamoDB>;
};

const dictionaries: Record<Locale, AppDict> = {
  en: { shared: enShared, s3: enS3, sns: enSNS, sqs: enSQS, lambda: enLambda, dynamodb: enDynamoDB },
  es: { shared: esShared, s3: esS3, sns: esSNS, sqs: esSQS, lambda: esLambda, dynamodb: esDynamoDB },
};

export function getDictionary(locale: Locale): AppDict {
  return dictionaries[locale];
}
