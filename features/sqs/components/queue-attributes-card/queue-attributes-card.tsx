import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  attributes: Record<string, string>;
  dict: AppDict["sqs"]["queueDetail"];
};

export function QueueAttributesCard({ attributes, dict }: Props) {
  const entries = Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{dict.attributesTitle}</h2>
      <div className="max-h-[min(24rem,50vh)] overflow-auto rounded-lg border">
        <dl className="divide-y">
          {entries.map(([key, value]) => (
            <div key={key} className="grid gap-1 px-3 py-2 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
              <dt className="break-words text-xs font-medium text-muted-foreground">{key}</dt>
              <dd className="wrap-break-word font-mono text-xs sm:text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
