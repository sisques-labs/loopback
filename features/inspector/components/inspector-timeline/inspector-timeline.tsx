import { getServiceColorClasses } from "@/features/inspector/lib/service-color/service-color";
import { RequestCard } from "@/features/inspector/components/request-card/request-card";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import { cn } from "@/lib/utils";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ──────────────────────────────────────────────────────────────────────

type CardDict = Pick<WidenStringLiterals<InspectorDict>, "card">;

type InspectorTimelineProps = {
  entries: RequestEntry[];
  dict: CardDict;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function InspectorTimeline({ entries, dict }: InspectorTimelineProps) {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col">
      {sorted.map((entry, idx) => (
        <div key={entry.id} className="flex gap-3">
          {/* Spine column */}
          <div className="flex flex-col items-center">
            <div
              data-testid="spine-dot"
              className={cn(
                "mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-background",
                getServiceColorClasses(entry.service).spine,
              )}
            />
            {idx < sorted.length - 1 && (
              <div className="w-px flex-1 bg-border" />
            )}
          </div>

          {/* Card column */}
          <div className="mb-3 flex-1">
            <RequestCard entry={entry} dict={dict} />
          </div>
        </div>
      ))}
    </div>
  );
}
