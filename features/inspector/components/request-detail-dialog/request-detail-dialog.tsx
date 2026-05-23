"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getServiceColorClasses } from "@/features/inspector/lib/service-color/service-color";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type DetailDict = {
  title: string;
  input: string;
  output: string;
  attempts: string;
  duration: string;
  timestamp: string;
  error: string;
  closeLabel: string;
};

type RequestDetailDialogProps = {
  open: boolean;
  entry: RequestEntry;
  dict: DetailDict;
  onClose: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function RequestDetailDialog({ open, entry, dict, onClose }: RequestDetailDialogProps) {
  const colorClasses = getServiceColorClasses(entry.service);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        closeLabel={dict.closeLabel}
        className="sm:max-w-2xl overflow-auto max-h-[90dvh]"
      >
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold",
                  colorClasses.badge,
                )}
              >
                {entry.service}
              </span>
              <span>{entry.operation}</span>
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Meta grid */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{dict.timestamp}</dt>
          <dd>{new Date(entry.timestamp).toISOString()}</dd>

          <dt className="text-muted-foreground">{dict.duration}</dt>
          <dd>{entry.durationMs}ms</dd>

          <dt className="text-muted-foreground">{dict.attempts}</dt>
          <dd>{entry.attempts}</dd>
        </dl>

        {/* Error section */}
        {entry.status === "error" && entry.error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
            <p className="font-semibold text-destructive mb-1">{dict.error}</p>
            <p className="text-destructive/80">{entry.error.message}</p>
            {entry.error.name && (
              <p className="text-xs text-muted-foreground mt-1">{entry.error.name}</p>
            )}
          </div>
        )}

        {/* Input */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">{dict.input}</p>
          <pre className="font-mono text-xs overflow-auto max-h-64 rounded bg-muted p-2">
            {JSON.stringify(entry.input, null, 2)}
          </pre>
        </div>

        {/* Output */}
        {entry.output != null && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">{dict.output}</p>
            <pre className="font-mono text-xs overflow-auto max-h-64 rounded bg-muted p-2">
              {JSON.stringify(entry.output, null, 2)}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
