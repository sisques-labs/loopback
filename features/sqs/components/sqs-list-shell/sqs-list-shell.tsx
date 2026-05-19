"use client";

import { useMemo, useState } from "react";
import { useListRefresh } from "@/features/shared/hooks/use-list-refresh";
import { listQueuesAction } from "@/features/sqs/use-cases/list-queues-action/list-queues-action";
import { QueueTable } from "@/features/sqs/components/queue-table/queue-table";
import type { QueueListItem } from "@/features/sqs/types/sqs";
import type { Locale } from "@/features/shared/i18n/locale";

// ── Constants ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

// ── Types ─────────────────────────────────────────────────────────────────

type SQSListShellDict = {
  queueTable: {
    name: string;
    url: string;
    type: string;
    typeFifo: string;
    typeStandard: string;
  };
  queueRowActions: {
    actions: string;
    delete: string;
    deleteTitle: string;
    deleteConfirm: string;
    viewDetail: string;
  };
  confirmDialog: { cancel: string; confirm: string; confirming: string };
  page: {
    title: string;
    empty: string;
    filterPlaceholder: string;
    filterEmpty: string;
  };
  dialog: { close: string };
};

type Props = {
  initialItems: QueueListItem[];
  dict: SQSListShellDict;
  localePrefix: string;
  locale: Locale;
};

// ── Component ─────────────────────────────────────────────────────────────

export function SQSListShell({ initialItems, dict, localePrefix, locale }: Props) {
  const { items } = useListRefresh(listQueuesAction, {
    intervalMs: POLL_INTERVAL_MS,
    initialItems,
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!filterText) return items;
    const lower = filterText.toLowerCase();
    return items.filter((q) => q.name.toLowerCase().includes(lower));
  }, [items, filterText]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder={dict.page.filterPlaceholder}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:max-w-xs"
        aria-label={dict.page.filterPlaceholder}
      />

      {filteredItems.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {filterText ? dict.page.filterEmpty : dict.page.empty}
        </p>
      ) : (
        <QueueTable
          queues={filteredItems}
          dict={dict.queueTable}
          rowActionsDict={dict.queueRowActions}
          confirmDict={dict.confirmDialog}
          localePrefix={localePrefix}
          locale={locale}
          closeLabel={dict.dialog.close}
        />
      )}
    </div>
  );
}
