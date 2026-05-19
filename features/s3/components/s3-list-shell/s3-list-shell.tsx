"use client";

import { useMemo, useState } from "react";
import { useListRefresh } from "@/features/shared/hooks/use-list-refresh";
import { listBucketsAction } from "@/features/s3/use-cases/list-buckets-action/list-buckets-action";
import { BucketTable } from "@/features/s3/components/bucket-table/bucket-table";
import type { Bucket } from "@/features/s3/types/s3";

// ── Constants ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

// ── Types ─────────────────────────────────────────────────────────────────

type S3ListShellDict = {
  bucketTable: { name: string; created: string };
  bucketRowActions: {
    actions: string;
    delete: string;
    deleteTitle: string;
    deleteConfirm: string;
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
  initialItems: Bucket[];
  dict: S3ListShellDict;
  localePrefix: string;
};

// ── Component ─────────────────────────────────────────────────────────────

export function S3ListShell({ initialItems, dict, localePrefix }: Props) {
  const { items } = useListRefresh(listBucketsAction, {
    intervalMs: POLL_INTERVAL_MS,
    initialItems,
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!filterText) return items;
    const lower = filterText.toLowerCase();
    return items.filter((b) => b.name.toLowerCase().includes(lower));
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
        <BucketTable
          buckets={filteredItems}
          dict={dict.bucketTable}
          localePrefix={localePrefix}
          rowActionsDict={dict.bucketRowActions}
          confirmDict={dict.confirmDialog}
          closeLabel={dict.dialog.close}
        />
      )}
    </div>
  );
}
