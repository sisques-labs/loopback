"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ItemViewDialog } from "@/features/dynamodb/components/item-view-dialog/item-view-dialog";
import { PutItemDialog } from "@/features/dynamodb/components/put-item-dialog/put-item-dialog";
import { DeleteItemButton } from "@/features/dynamodb/components/delete-item-button/delete-item-button";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type Props = {
  tableName: string;
  items: Record<string, unknown>[];
  nextKey: string | null;
  partitionKeyName: string;
  sortKeyName?: string;
  dict: AppDict["dynamodb"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  locale: Locale;
  localePrefix: string;
};

export function ScanTable({
  tableName,
  items,
  nextKey,
  partitionKeyName,
  sortKeyName,
  dict,
  confirmDict,
  locale,
  localePrefix,
}: Props) {
  const [viewItem, setViewItem] = useState<Record<string, unknown> | null>(null);
  const scanDict = dict.scan;
  const tableDict = dict.table;

  function getItemKey(item: Record<string, unknown>): Record<string, unknown> {
    const key: Record<string, unknown> = {
      [partitionKeyName]: item[partitionKeyName],
    };
    if (sortKeyName && item[sortKeyName] !== undefined) {
      key[sortKeyName] = item[sortKeyName];
    }
    return key;
  }

  function formatKeyValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold break-words font-mono">{tableName}</h1>
        </div>
        <PutItemDialog tableName={tableName} dict={dict.putItemDialog} locale={locale} />
      </div>

      {items.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">{scanDict.empty}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-0">{partitionKeyName}</TableHead>
                {sortKeyName && (
                  <TableHead className="hidden sm:table-cell">{sortKeyName}</TableHead>
                )}
                <TableHead className="w-24">{tableDict.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-none">
                    <span className="block truncate font-mono text-sm sm:overflow-visible sm:whitespace-normal">
                      {formatKeyValue(item[partitionKeyName])}
                    </span>
                  </TableCell>
                  {sortKeyName && (
                    <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                      {formatKeyValue(item[sortKeyName])}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-11 min-w-11 md:min-h-9 md:min-w-9"
                        onClick={() => setViewItem(item)}
                      >
                        {tableDict.view}
                      </Button>
                      <DeleteItemButton
                        tableName={tableName}
                        itemKey={getItemKey(item)}
                        dict={dict.deleteItemDialog}
                        confirmDict={confirmDict}
                        locale={locale}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {nextKey && (
            <div className="flex justify-end">
              <Link
                href={`${localePrefix}/dynamodb/${encodeURIComponent(tableName)}?startKey=${nextKey}`}
              >
                <Button variant="outline" size="sm" className="min-h-11 min-w-11 md:min-h-9 md:min-w-9">
                  {scanDict.next}
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Item view dialog */}
      {viewItem && (
        <ItemViewDialog
          open={viewItem !== null}
          onOpenChange={(open) => { if (!open) setViewItem(null); }}
          item={viewItem}
          dict={dict.itemViewDialog}
        />
      )}
    </div>
  );
}
