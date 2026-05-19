"use client";

import { useListRefresh } from "@/features/shared/hooks/use-list-refresh";
import { listTablesAction } from "@/features/dynamodb/use-cases/list-tables-action/list-tables-action";
import { TableList } from "@/features/dynamodb/components/table-list/table-list";
import type { DynamoDBTable } from "@/features/dynamodb/types/dynamodb";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

// ── Constants ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

// ── Types ─────────────────────────────────────────────────────────────────

type DynamoDBListShellDict = AppDict["dynamodb"] & {
  confirmDialog: AppDict["shared"]["confirmDialog"];
  dialog: { close: string };
};

type Props = {
  initialItems: DynamoDBTable[];
  dict: DynamoDBListShellDict;
  localePrefix: string;
  locale: Locale;
};

// ── Component ─────────────────────────────────────────────────────────────

export function DynamoDBListShell({ initialItems, dict, localePrefix, locale }: Props) {
  const { items } = useListRefresh(listTablesAction, {
    intervalMs: POLL_INTERVAL_MS,
    initialItems,
  });

  return (
    <TableList
      tables={items}
      dict={dict}
      confirmDict={dict.confirmDialog}
      locale={locale}
      localePrefix={localePrefix}
      closeLabel={dict.dialog.close}
    />
  );
}
