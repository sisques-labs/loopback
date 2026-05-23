import { RequestCard } from "@/features/inspector/components/request-card/request-card";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ──────────────────────────────────────────────────────────────────────

type CardDict = Pick<WidenStringLiterals<InspectorDict>, "card">;

type RequestListProps = {
  entries: RequestEntry[];
  dict: CardDict;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function RequestList({ entries, dict }: RequestListProps) {
  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <RequestCard key={entry.id} entry={entry} dict={dict} />
      ))}
    </div>
  );
}
