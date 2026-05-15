"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateTableDialog } from "@/features/dynamodb/components/create-table-dialog/create-table-dialog";
import { DeleteTableDialog } from "@/features/dynamodb/components/delete-table-dialog/delete-table-dialog";
import type { DynamoDBTable } from "@/features/dynamodb/types/dynamodb";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type Props = {
  tables: DynamoDBTable[];
  dict: AppDict["dynamodb"];
  confirmDict: AppDict["shared"]["confirmDialog"];
  locale: Locale;
  localePrefix: string;

    closeLabel: string;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function TableList({ tables, dict, confirmDict, locale, localePrefix, closeLabel}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold break-words">{dict.page.title}</h1>
        </div>
        <CreateTableDialog dict={dict.createTableDialog} locale={locale}  closeLabel={closeLabel}/>
      </div>

      {tables.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">{dict.page.empty}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-0">{dict.table.name}</TableHead>
              <TableHead>{dict.table.status}</TableHead>
              <TableHead className="hidden sm:table-cell">{dict.table.itemCount}</TableHead>
              <TableHead className="hidden sm:table-cell">{dict.table.sizeBytes}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((t) => (
              <TableRow key={t.name}>
                <TableCell className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-none">
                  <Link
                    href={`${localePrefix}/dynamodb/${encodeURIComponent(t.name)}`}
                    className="block truncate font-mono font-medium hover:underline sm:overflow-visible sm:whitespace-normal"
                  >
                    {t.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={t.status === "ACTIVE" ? "default" : "secondary"}>
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {t.itemCount}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {formatBytes(t.tableSizeBytes)}
                </TableCell>
                <TableCell>
                  <DeleteTableDialog
                    tableName={t.name}
                    dict={dict.deleteTableDialog}
                    confirmDict={confirmDict}
                    locale={locale}
                    closeLabel={closeLabel}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
