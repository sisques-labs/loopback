import { FunctionTable } from "@/features/lambda/components/function-table/function-table";
import { LambdaEmptyState } from "@/features/lambda/components/lambda-empty-state/lambda-empty-state";
import { listFunctions } from "@/features/lambda/services/list-functions/list-functions";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LambdaPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const lambda = dict.lambda;
  const localePrefix = `/${locale}`;
  const functions = await listFunctions();

  if (functions.length === 0) {
    return <LambdaEmptyState dict={lambda.page} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-xl font-semibold break-words">{lambda.page.title}</h1>
      </div>
      <FunctionTable
        functions={functions}
        dict={lambda.table}
        rowActionsDict={lambda.rowActions}
        invokeDialogDict={lambda.invokeDialog}
        localePrefix={localePrefix}
        locale={locale}
      />
    </div>
  );
}
