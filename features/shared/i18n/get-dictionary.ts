import enShared from "./en";
import esShared from "./es";
import enDashboard from "@/features/dashboard/i18n/en";
import esDashboard from "@/features/dashboard/i18n/es";
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
import enTerminal from "@/features/terminal/i18n/en";
import esTerminal from "@/features/terminal/i18n/es";
import enLogs from "@/features/logs/i18n/en";
import esLogs from "@/features/logs/i18n/es";
import enSeed from "@/features/seed/i18n/en";
import esSeed from "@/features/seed/i18n/es";
import type { Locale } from "./locale";
import type { WidenStringLiterals } from "./widen-literals";

export type AppDict = {
  shared: WidenStringLiterals<typeof enShared>;
  dashboard: WidenStringLiterals<typeof enDashboard>;
  s3: WidenStringLiterals<typeof enS3>;
  sns: WidenStringLiterals<typeof enSNS>;
  sqs: WidenStringLiterals<typeof enSQS>;
  lambda: WidenStringLiterals<typeof enLambda>;
  dynamodb: WidenStringLiterals<typeof enDynamoDB>;
  terminal: WidenStringLiterals<typeof enTerminal>;
  logs: WidenStringLiterals<typeof enLogs>;
  seed: WidenStringLiterals<typeof enSeed>;
};

const dictionaries: Record<Locale, AppDict> = {
  en: {
    shared: enShared,
    dashboard: enDashboard,
    s3: enS3,
    sns: enSNS,
    sqs: enSQS,
    lambda: enLambda,
    dynamodb: enDynamoDB,
    terminal: enTerminal,
    logs: enLogs,
    seed: enSeed,
  },
  es: {
    shared: esShared,
    dashboard: esDashboard,
    s3: esS3,
    sns: esSNS,
    sqs: esSQS,
    lambda: esLambda,
    dynamodb: esDynamoDB,
    terminal: esTerminal,
    logs: esLogs,
    seed: esSeed,
  },
};

export function getDictionary(locale: Locale): AppDict {
  return dictionaries[locale];
}
