"use client";

import { useListRefresh } from "@/features/shared/hooks/use-list-refresh";
import { listTopicsAction } from "@/features/sns/use-cases/list-topics-action/list-topics-action";
import { TopicTable } from "@/features/sns/components/topic-table/topic-table";
import type { Topic } from "@/features/sns/types/sns";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

// ── Constants ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

// ── Types ─────────────────────────────────────────────────────────────────

type SNSListShellDict = {
  topicTable: AppDict["sns"]["topicTable"];
  topicRowActions: AppDict["sns"]["topicRowActions"];
  confirmDialog: AppDict["shared"]["confirmDialog"];
  publishDialog: AppDict["sns"]["publishDialog"];
  page: { title: string; empty: string };
  dialog: { close: string };
};

type Props = {
  initialItems: Topic[];
  dict: SNSListShellDict;
  localePrefix: string;
  locale: Locale;
};

// ── Component ─────────────────────────────────────────────────────────────

export function SNSListShell({ initialItems, dict, localePrefix, locale }: Props) {
  const { items } = useListRefresh(listTopicsAction, {
    intervalMs: POLL_INTERVAL_MS,
    initialItems,
  });

  if (items.length === 0) {
    return (
      <p className="mt-1 text-sm text-muted-foreground">{dict.page.empty}</p>
    );
  }

  return (
    <TopicTable
      topics={items}
      dict={dict.topicTable}
      rowActionsDict={dict.topicRowActions}
      confirmDict={dict.confirmDialog}
      publishDict={dict.publishDialog}
      localePrefix={localePrefix}
      locale={locale}
      closeLabel={dict.dialog.close}
    />
  );
}
