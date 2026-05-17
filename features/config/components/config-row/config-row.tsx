import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  annotation?: string;
  className?: string;
};

export function ConfigRow({ label, value, annotation, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2">
        <code className="block max-w-full overflow-x-auto rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs">
          {value}
        </code>
        {annotation && (
          <span className="text-xs text-muted-foreground">{annotation}</span>
        )}
      </dd>
    </div>
  );
}
