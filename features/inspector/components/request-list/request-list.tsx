import { RequestCard } from "@/features/inspector/components/request-card/request-card";
import type { RequestEntry } from "@/features/inspector/lib/types/types";

// ── Types ──────────────────────────────────────────────────────────────────────

type RequestListProps = {
  entries: RequestEntry[];
};

// ── Component ─────────────────────────────────────────────────────────────────

export function RequestList({ entries }: RequestListProps) {
  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <RequestCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
