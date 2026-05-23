import { SearchX } from "lucide-react";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ──────────────────────────────────────────────────────────────────────

type EmptyDict = Pick<WidenStringLiterals<InspectorDict>, "empty">;

type InspectorEmptyProps = {
  dict: EmptyDict;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function InspectorEmpty({ dict }: InspectorEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <SearchX className="h-10 w-10 opacity-40" />
      <div>
        <p className="text-sm font-medium">{dict.empty.title}</p>
        <p className="mt-1 text-xs">{dict.empty.body}</p>
      </div>
    </div>
  );
}
