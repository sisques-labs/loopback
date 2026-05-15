import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { getFunction } from "@/features/lambda/services/get-function/get-function";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { decodeFunctionNameParam } from "@/features/lambda/lib/route-codec";
import { LambdaDetailToolbar } from "@/features/lambda/components/lambda-detail-toolbar/lambda-detail-toolbar";
import { Badge } from "@/components/ui/badge";
import { stateBadgeVariant, stateLabel } from "@/features/lambda/lib/state-badge";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string; functionName: string }>;
};

export default async function LambdaFunctionDetailPage({ params }: Props) {
  const { lang, functionName: functionNameParam } = await params;
  const functionName = decodeFunctionNameParam(functionNameParam);
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const d = dict.lambda.detail;
  const tableDict = dict.lambda.table;
  const localePrefix = `/${locale}`;

  const fn = await getFunction(functionName);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`${localePrefix}/lambda`}
          className="inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground md:min-h-9 md:min-w-9"
        >
          <ArrowLeftIcon className="size-4" />
          {d.back}
        </Link>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="break-words font-mono text-xl font-semibold">{fn.functionName}</h1>
          <p className="mt-1 min-w-0 truncate font-mono text-sm text-muted-foreground sm:overflow-visible sm:whitespace-normal">
            {fn.functionArn}
          </p>
        </div>
        <LambdaDetailToolbar
          functionName={fn.functionName}
          locale={locale}
          invokeDialogDict={dict.lambda.invokeDialog}
          updateCodeDialogDict={dict.lambda.updateCodeDialog}
          replaceCodeCta={d.replaceCodeCta}
          trailing={
            fn.state ? (
              <Badge variant={stateBadgeVariant(fn.state)}>{stateLabel(fn.state, tableDict)}</Badge>
            ) : null
          }
          closeLabel={dict.shared.dialog.close}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.functionNameLabel}</p>
          <p className="mt-1 break-all font-mono text-sm font-medium">{fn.functionName}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.functionArnLabel}</p>
          <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{fn.functionArn}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.runtimeLabel}</p>
          <p className="mt-1 font-mono text-sm font-medium">{fn.runtime || "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.handlerLabel}</p>
          <p className="mt-1 font-mono text-sm font-medium">{fn.handler || "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.descriptionLabel}</p>
          <p className="mt-1 text-sm">{fn.description || "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.timeoutLabel}</p>
          <p className="mt-1 text-sm font-medium">{fn.timeout > 0 ? fn.timeout : "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.memorySizeLabel}</p>
          <p className="mt-1 text-sm font-medium">{fn.memorySize > 0 ? fn.memorySize : "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.lastModifiedLabel}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{fn.lastModified || "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{d.stateLabel}</p>
          <div className="mt-1">
            {fn.state ? (
              <Badge variant={stateBadgeVariant(fn.state)}>{stateLabel(fn.state, tableDict)}</Badge>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
