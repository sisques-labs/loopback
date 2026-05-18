"use client";

import { useEffect } from "react";
import { useLogsStore } from "@/features/shared/stores/use-logs-store";
import { LogsToolbar } from "@/features/logs/components/logs-toolbar/logs-toolbar";
import { LogSearch } from "@/features/logs/components/log-search/log-search";
import { LogsPanel } from "@/features/logs/components/logs-panel/logs-panel";
import { cn } from "@/lib/utils";
import type { LogsDict } from "@/features/logs/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ────────────────────────────────────────────────────────────────────

export type LogViewerShellDict = WidenStringLiterals<LogsDict>;

type LogViewerShellProps = {
  dict: LogViewerShellDict;
  services: string[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(lastUpdatedAt: number): string {
  const seconds = Math.floor((Date.now() - lastUpdatedAt) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function LogViewerShell({ dict, services }: LogViewerShellProps) {
  const { startPolling, stopPolling, status, lastUpdatedAt } = useLogsStore();

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Status indicator text
  const statusText =
    status === "polling"
      ? dict.status.polling
      : status === "error"
        ? dict.status.error
        : dict.status.idle;

  const statusColor =
    status === "polling"
      ? "text-green-600 dark:text-green-400"
      : status === "error"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="flex h-full flex-col gap-0">
      {/* Page header */}
      <div className="flex flex-col gap-1 px-4 py-3 border-b border-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{dict.title}</h1>
          {lastUpdatedAt && (
            <p className="text-xs text-muted-foreground">
              {dict.updatedAt.replace("{time}", formatElapsed(lastUpdatedAt))}
            </p>
          )}
        </div>
        <span className={cn("text-sm font-medium", statusColor)}>
          {statusText}
        </span>
      </div>

      {/* Toolbar and search */}
      <LogsToolbar dict={dict} services={services} />
      <LogSearch dict={dict} />

      {/* Log panel */}
      <LogsPanel dict={dict} />
    </div>
  );
}
