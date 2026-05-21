import { CreateFunctionDialog } from "@/features/lambda/components/create-function-dialog/create-function-dialog";
import { LambdaListShell } from "@/features/lambda/components/lambda-list-shell/lambda-list-shell";
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
  const shared = dict.shared;
  const localePrefix = `/${locale}`;
  const functions = await listFunctions();

  const shellDict = {
    table: lambda.table,
    rowActions: lambda.rowActions,
    invokeDialog: lambda.invokeDialog,
    updateCodeDialog: lambda.updateCodeDialog,
    copyButton: shared.copyButton,
    page: lambda.page,
    dialog: shared.dialog,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold break-words">{lambda.page.title}</h1>
        </div>
        <CreateFunctionDialog
          dict={lambda.createFunctionDialog}
          locale={locale}
          closeLabel={shared.dialog.close}
        />
      </div>
      <LambdaListShell
        initialItems={functions}
        dict={shellDict}
        localePrefix={localePrefix}
        locale={locale}
      />
    </div>
  );
}
