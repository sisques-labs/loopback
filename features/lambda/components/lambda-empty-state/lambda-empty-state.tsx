import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  dict: AppDict["lambda"]["page"];
};

export function LambdaEmptyState({ dict }: Props) {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold break-words">{dict.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.empty}</p>
      </div>
    </div>
  );
}
