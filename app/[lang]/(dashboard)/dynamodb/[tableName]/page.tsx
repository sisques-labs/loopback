import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { ScanTable } from "@/features/dynamodb/components/scan-table/scan-table";
import { TableDetailPanel } from "@/features/dynamodb/components/table-detail-panel/table-detail-panel";
import { scanTable } from "@/features/dynamodb/services/scan-table/scan-table";
import { queryTable } from "@/features/dynamodb/services/query-table/query-table";
import { listTables } from "@/features/dynamodb/services/list-tables/list-tables";
import { decodeScanStartKey } from "@/features/dynamodb/lib/route-codec";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import type { ScanResult } from "@/features/dynamodb/types/dynamodb";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string; tableName: string }>;
  searchParams: Promise<{
    startKey?: string;
    mode?: string;
    queryPk?: string;
    querySk?: string;
  }>;
};

export default async function DynamoDBTablePage({ params, searchParams }: Props) {
  const { lang, tableName: tableNameParam } = await params;
  const { startKey, mode: modeParam, queryPk, querySk } = await searchParams;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const tableName = decodeURIComponent(tableNameParam);
  const decodedStartKey = decodeScanStartKey(startKey);
  const mode = modeParam === "query" ? "query" : "scan";
  const isQueryMode = mode === "query";

  const tables = await listTables().catch(() => []);
  const tableInfo = tables.find((t) => t.name === tableName);
  const partitionKeyName = tableInfo?.partitionKeyName ?? "pk";
  const sortKeyName = tableInfo?.sortKeyName;

  let result: ScanResult = { items: [], nextKey: null };

  if (isQueryMode && queryPk) {
    const skParam =
      querySk && sortKeyName ? { name: sortKeyName, value: querySk } : undefined;
    result = await queryTable(
      tableName,
      { name: partitionKeyName, value: queryPk },
      skParam,
      decodedStartKey,
    ).catch(() => ({ items: [], nextKey: null }));
  } else if (!isQueryMode) {
    result = await scanTable(tableName, decodedStartKey).catch(() => ({
      items: [],
      nextKey: null,
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`${localePrefix}/dynamodb`}
          className="inline-flex min-h-11 min-w-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground md:min-h-9 md:min-w-9"
        >
          <ArrowLeftIcon className="size-4" />
          {dict.dynamodb.scan.back}
        </Link>
      </div>

      {tableInfo && (
        <TableDetailPanel table={tableInfo} dict={dict.dynamodb.tableDetail} />
      )}

      <ScanTable
        tableName={tableName}
        items={result.items}
        nextKey={result.nextKey}
        partitionKeyName={partitionKeyName}
        sortKeyName={sortKeyName}
        mode={mode}
        queryPk={queryPk}
        querySk={querySk}
        dict={dict.dynamodb}
        confirmDict={dict.shared.confirmDialog}
        copyButtonDict={dict.shared.copyButton}
        closeLabel={dict.shared.dialog.close}
        locale={locale}
        localePrefix={localePrefix}
      />
    </div>
  );
}
