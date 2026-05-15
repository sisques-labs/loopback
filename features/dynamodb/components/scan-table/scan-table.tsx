"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemViewDialog } from "@/features/dynamodb/components/item-view-dialog/item-view-dialog";
import { PutItemDialog } from "@/features/dynamodb/components/put-item-dialog/put-item-dialog";
import { DeleteItemButton } from "@/features/dynamodb/components/delete-item-button/delete-item-button";
import { EditItemDialog } from "@/features/dynamodb/components/edit-item-dialog/edit-item-dialog";
import { ItemsTable } from "@/features/dynamodb/components/items-table/items-table";
import { QueryForm } from "@/features/dynamodb/components/query-form/query-form";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type TableMode = "scan" | "query";

type Props = {
  tableName: string;
  items: Record<string, unknown>[];
  nextKey: string | null;
  partitionKeyName: string;
  sortKeyName?: string;
  mode?: TableMode;
  queryPk?: string;
  querySk?: string;
  dict: AppDict["dynamodb"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  locale: Locale;
  localePrefix: string;

    closeLabel: string;
};

function buildTableHref(
  localePrefix: string,
  tableName: string,
  params: Record<string, string | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const query = sp.toString();
  const base = `${localePrefix}/dynamodb/${encodeURIComponent(tableName)}`;
  return query ? `${base}?${query}` : base;
}

export function ScanTable({
  tableName,
  items,
  nextKey,
  partitionKeyName,
  sortKeyName,
  mode = "scan",
  queryPk,
  querySk,
  dict,
  confirmDict,
  locale,
  localePrefix, closeLabel}: Props) {
  const [viewItem, setViewItem] = useState<Record<string, unknown> | null>(null);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const scanDict = dict.scan;
  const tableDict = dict.table;
  const queryDict = dict.query;
  const isQueryMode = mode === "query";

  const scanHref = buildTableHref(localePrefix, tableName, { mode: "scan" });
  const queryHref = buildTableHref(localePrefix, tableName, { mode: "query" });

  const nextPageParams: Record<string, string | undefined> = isQueryMode
    ? {
        mode: "query",
        queryPk,
        querySk,
        startKey: nextKey ?? undefined,
      }
    : { startKey: nextKey ?? undefined };

  const nextPageHref =
    nextKey != null ? buildTableHref(localePrefix, tableName, nextPageParams) : null;

  const emptyMessage = isQueryMode ? queryDict.empty : scanDict.empty;

  function getItemKey(item: Record<string, unknown>): Record<string, unknown> {
    const key: Record<string, unknown> = {
      [partitionKeyName]: item[partitionKeyName],
    };
    if (sortKeyName && item[sortKeyName] !== undefined) {
      key[sortKeyName] = item[sortKeyName];
    }
    return key;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold break-words font-mono">{tableName}</h1>
        </div>
        <PutItemDialog
          tableName={tableName}
          partitionKeyName={partitionKeyName}
          sortKeyName={sortKeyName}
          dict={dict.putItemDialog}
          locale={locale}
         closeLabel={closeLabel}/>
      </div>

      <div
        className="inline-flex w-full min-w-0 rounded-lg border border-border p-1 sm:w-auto"
        role="group"
        aria-label={`${queryDict.modeScan} / ${queryDict.modeQuery}`}
      >
        <Link href={scanHref} className="flex-1 sm:flex-initial">
          <Button
            type="button"
            variant={isQueryMode ? "ghost" : "secondary"}
            size="sm"
            className="w-full min-h-11 min-w-11 md:min-h-9 md:min-w-9"
            aria-pressed={!isQueryMode}
          >
            {queryDict.modeScan}
          </Button>
        </Link>
        <Link href={queryHref} className="flex-1 sm:flex-initial">
          <Button
            type="button"
            variant={isQueryMode ? "secondary" : "ghost"}
            size="sm"
            className="w-full min-h-11 min-w-11 md:min-h-9 md:min-w-9"
            aria-pressed={isQueryMode}
          >
            {queryDict.modeQuery}
          </Button>
        </Link>
      </div>

      {isQueryMode && (
        <QueryForm
          tableName={tableName}
          partitionKeyName={partitionKeyName}
          sortKeyName={sortKeyName}
          initialPk={queryPk}
          initialSk={querySk}
          localePrefix={localePrefix}
          dict={queryDict}
        />
      )}

      <ItemsTable
        items={items}
        partitionKeyName={partitionKeyName}
        sortKeyName={sortKeyName}
        tableDict={tableDict}
        emptyMessage={emptyMessage}
        nextPageLabel={scanDict.next}
        nextKey={nextKey}
        nextPageHref={nextPageHref}
        renderRowActions={(item) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
              onClick={() => setViewItem(item)}
            >
              {tableDict.view}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
              onClick={() => setEditItem(item)}
            >
              <PencilIcon className="size-4" />
              <span className="sr-only">{dict.editItemDialog.trigger}</span>
            </Button>
            <DeleteItemButton
              tableName={tableName}
              itemKey={getItemKey(item)}
              dict={dict.deleteItemDialog}
              confirmDict={confirmDict}
              locale={locale}
             closeLabel={closeLabel}/>
          </>
        )}
      />

      {viewItem && (
        <ItemViewDialog
          open={viewItem !== null}
          onOpenChange={(open) => {
            if (!open) setViewItem(null);
          }}
          item={viewItem}
          dict={dict.itemViewDialog}
          closeLabel={closeLabel}
        />
      )}

      {editItem && (
        <EditItemDialog
          open={editItem !== null}
          onOpenChange={(open) => {
            if (!open) setEditItem(null);
          }}
          tableName={tableName}
          item={editItem}
          partitionKeyName={partitionKeyName}
          sortKeyName={sortKeyName}
          dict={dict.editItemDialog}
          locale={locale}
          closeLabel={closeLabel}
        />
      )}
    </div>
  );
}
