import type { DynamoDBTable } from "@/features/dynamodb/types/dynamodb";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type TableDetailPanelProps = {
  table: DynamoDBTable;
  dict: AppDict["dynamodb"]["tableDetail"];
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-mono">{value}</dd>
    </div>
  );
}

export function TableDetailPanel({ table, dict }: TableDetailPanelProps) {
  const sortKeyDisplay = table.sortKeyName
    ? `${table.sortKeyName} (${table.sortKeyType ?? "?"})`
    : dict.noSortKey;

  const creationDateDisplay = table.creationDateTime
    ? new Date(table.creationDateTime).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : dict.noSortKey;

  return (
    <section aria-label="Table metadata" className="rounded-lg border bg-card p-4">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <DetailRow
          label={dict.partitionKey}
          value={`${table.partitionKeyName} (${table.partitionKeyType})`}
        />
        <DetailRow label={dict.sortKey} value={sortKeyDisplay} />
        <DetailRow label={dict.status} value={table.status} />
        <DetailRow label={dict.items} value={table.itemCount.toLocaleString()} />
        <DetailRow label={dict.size} value={table.tableSizeBytes.toLocaleString()} />
        <DetailRow label={dict.creationDate} value={creationDateDisplay} />
        <DetailRow label={dict.billingMode} value={table.billingMode ?? "PROVISIONED"} />
        <DetailRow label={dict.gsiCount} value={table.gsiCount ?? 0} />
      </dl>
    </section>
  );
}
