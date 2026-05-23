"use client";

import { useState } from "react";
import { getServiceColorClasses } from "@/features/inspector/lib/service-color/service-color";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import { RequestDetailDialog } from "@/features/inspector/components/request-detail-dialog/request-detail-dialog";
import { cn } from "@/lib/utils";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ──────────────────────────────────────────────────────────────────────

type CardDict = Pick<WidenStringLiterals<InspectorDict>, "card">;

type RequestCardProps = {
  entry: RequestEntry;
  dict: CardDict;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function RequestCard({ entry, dict }: RequestCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const colorClasses = getServiceColorClasses(entry.service);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="w-full text-left rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Service badge */}
          <span
            className={cn(
              "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold",
              colorClasses.badge,
            )}
          >
            {entry.service}
          </span>

          {/* Operation name */}
          <span className="text-sm font-medium flex-1 min-w-0 truncate">
            {entry.operation}
          </span>

          {/* Duration pill */}
          <span className="text-xs rounded bg-muted px-1.5 py-0.5">
            {entry.durationMs}ms
          </span>

          {/* Retry badge — only when attempts > 1 */}
          {entry.attempts > 1 && (
            <span
              data-testid="retry-badge"
              className="inline-flex items-center rounded border border-yellow-500/20 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-700"
            >
              {dict.card.retries.replace("{n}", String(entry.attempts - 1))}
            </span>
          )}

          {/* Status indicator */}
          <span
            data-testid="status-indicator"
            data-status={entry.status}
            className={cn(
              "inline-block h-2 w-2 rounded-full shrink-0",
              entry.status === "success" ? "bg-green-500" : "bg-red-500",
            )}
          />
        </div>
      </button>

      <RequestDetailDialog
        open={dialogOpen}
        entry={entry}
        onClose={() => setDialogOpen(false)}
        dict={{
          title: "Request Detail",
          input: "Input",
          output: "Output",
          attempts: "Attempts",
          duration: "Duration",
          timestamp: "Timestamp",
          error: "Error",
          closeLabel: "Close",
        }}
      />
    </>
  );
}
