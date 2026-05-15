import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { ScanTable } from "@/features/dynamodb/components/scan-table/scan-table";
import { DynamoDBEmptyState } from "@/features/dynamodb/components/dynamodb-empty-state/dynamodb-empty-state";
import { TableDetailPanel } from "@/features/dynamodb/components/table-detail-panel/table-detail-panel";
import { scanTable } from "@/features/dynamodb/services/scan-table/scan-table";
import { listTables } from "@/features/dynamodb/services/list-tables/list-tables";
import { decodeScanStartKey } from "@/features/dynamodb/lib/route-codec";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string; tableName: string }>;
  searchParams: Promise<{ startKey?: string }>;
};

export default async function DynamoDBTablePage({ params, searchParams }: Props) {
  const { lang, tableName: tableNameParam } = await params;
  const { startKey } = await searchParams;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const localePrefix = `/${locale}`;

  const tableName = decodeURIComponent(tableNameParam);
  const decodedStartKey = decodeScanStartKey(startKey);

  // Get table metadata (PK/SK names) and scan results in parallel
  const [tables, scanResult] = await Promise.all([
    listTables().catch(() => []),
    scanTable(tableName, decodedStartKey).catch(() => ({ items: [], nextKey: null })),
  ]);

  const tableInfo = tables.find((t) => t.name === tableName);
  const partitionKeyName = tableInfo?.partitionKeyName ?? "pk";
  const sortKeyName = tableInfo?.sortKeyName;

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
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

      {scanResult.items.length === 0 && !startKey ? (
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold font-mono break-words">{tableName}</h1>
          <DynamoDBEmptyState dict={dict.dynamodb.page} />
        </div>
      ) : (
        <ScanTable
          tableName={tableName}
          items={scanResult.items}
          nextKey={scanResult.nextKey}
          partitionKeyName={partitionKeyName}
          sortKeyName={sortKeyName}
          dict={dict.dynamodb}
          confirmDict={dict.shared.confirmDialog}
          locale={locale}
          localePrefix={localePrefix}
        />
      )}
    </div>
  );
}
