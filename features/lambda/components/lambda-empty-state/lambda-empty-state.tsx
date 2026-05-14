import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  dict: AppDict["lambda"]["page"];
};

export function LambdaEmptyState({ dict }: Props) {
  return (
    <div className="min-w-0">
      <p className="mt-1 text-sm text-muted-foreground">{dict.empty}</p>
    </div>
  );
}
