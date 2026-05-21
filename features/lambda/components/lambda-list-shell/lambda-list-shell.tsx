"use client";

import { useListRefresh } from "@/features/shared/hooks/use-list-refresh";
import { listFunctionsAction } from "@/features/lambda/use-cases/list-functions-action/list-functions-action";
import { FunctionTable } from "@/features/lambda/components/function-table/function-table";
import type { LambdaFunction } from "@/features/lambda/types/lambda";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

// ── Constants ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

// ── Types ─────────────────────────────────────────────────────────────────

type LambdaListShellDict = {
  table: AppDict["lambda"]["table"];
  rowActions: AppDict["lambda"]["rowActions"];
  invokeDialog: AppDict["lambda"]["invokeDialog"];
  updateCodeDialog: AppDict["lambda"]["updateCodeDialog"];
  copyButton: AppDict["shared"]["copyButton"];
  page: { title: string; empty: string; createCta: string };
  dialog: { close: string };
};

type Props = {
  initialItems: LambdaFunction[];
  dict: LambdaListShellDict;
  localePrefix: string;
  locale: Locale;
};

// ── Component ─────────────────────────────────────────────────────────────

export function LambdaListShell({ initialItems, dict, localePrefix, locale }: Props) {
  const { items } = useListRefresh(listFunctionsAction, {
    intervalMs: POLL_INTERVAL_MS,
    initialItems,
  });

  if (items.length === 0) {
    return (
      <p className="mt-1 text-sm text-muted-foreground">{dict.page.empty}</p>
    );
  }

  return (
    <FunctionTable
      functions={items}
      dict={dict.table}
      rowActionsDict={dict.rowActions}
      invokeDialogDict={dict.invokeDialog}
      updateCodeDialogDict={dict.updateCodeDialog}
      copyButtonDict={dict.copyButton}
      localePrefix={localePrefix}
      locale={locale}
      closeLabel={dict.dialog.close}
    />
  );
}
