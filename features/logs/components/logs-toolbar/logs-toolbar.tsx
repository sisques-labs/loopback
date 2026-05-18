"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogsStore } from "@/features/shared/stores/use-logs-store";
import type { LogLevel } from "@/features/logs/lib/types/types";
import type { LogsDict } from "@/features/logs/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ────────────────────────────────────────────────────────────────────

type LogsToolbarDict = Pick<WidenStringLiterals<LogsDict>, "filters">;

type LogsToolbarProps = {
  dict: LogsToolbarDict;
  services: string[];
};

// ── Constants ────────────────────────────────────────────────────────────────

const LEVELS: LogLevel[] = ["info", "warn", "error", "unknown"];

const LEVEL_LABELS: Record<LogLevel, string> = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  unknown: "UNKNOWN",
};

// ── Component ────────────────────────────────────────────────────────────────

export function LogsToolbar({ dict, services }: LogsToolbarProps) {
  const { filters, setFilter } = useLogsStore();

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-border">
      {/* Service filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{dict.filters.service}</span>
        <Select
          value={filters.service || "all"}
          onValueChange={(value) =>
            setFilter("service", !value || value === "all" ? "" : value)
          }
        >
          <SelectTrigger size="sm" className="min-w-32">
            <SelectValue>
              {filters.service ? filters.service : dict.filters.allServices}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{dict.filters.allServices}</SelectItem>
            {services.map((svc) => (
              <SelectItem key={svc} value={svc}>
                {svc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{dict.filters.level}</span>
        <Select
          value={filters.level}
          onValueChange={(value) =>
            setFilter("level", (value ?? "all") as LogLevel | "all")
          }
        >
          <SelectTrigger size="sm" className="min-w-28">
            <SelectValue>
              {filters.level === "all"
                ? dict.filters.allLevels
                : LEVEL_LABELS[filters.level as LogLevel]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{dict.filters.allLevels}</SelectItem>
            {LEVELS.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {LEVEL_LABELS[lvl]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
