"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInspectorStore } from "@/features/inspector/stores/use-inspector-store/use-inspector-store";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ──────────────────────────────────────────────────────────────────────

type ToolbarDict = Pick<WidenStringLiterals<InspectorDict>, "toolbar">;

type InspectorToolbarProps = {
  dict: ToolbarDict;
  services: string[];
};

const STATUS_OPTIONS = ["all", "success", "error"] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function InspectorToolbar({ dict, services }: InspectorToolbarProps) {
  const { filters, setFilter, clearBuffer, view, setView } = useInspectorStore();
  const t = dict.toolbar;

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-border">
      {/* Service filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{t.filters.service.label}</span>
        <Select
          value={filters.service || "all"}
          onValueChange={(value) =>
            setFilter("service", value === "all" ? "" : (value ?? ""))
          }
        >
          <SelectTrigger size="sm" className="min-w-32">
            <SelectValue>{filters.service || t.filters.service.all}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.filters.service.all}</SelectItem>
            {services.map((svc) => (
              <SelectItem key={svc} value={svc}>
                {svc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{t.filters.status.label}</span>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilter("status", value as "all" | "success" | "error")
          }
        >
          <SelectTrigger size="sm" className="min-w-28">
            <SelectValue>
              {filters.status === "all"
                ? t.filters.status.all
                : t.filters.status[filters.status]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {t.filters.status[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View toggle — segmented control */}
      <div role="tablist" className="flex rounded-md border border-border overflow-hidden">
        <button
          type="button"
          role="tab"
          aria-pressed={view === "list"}
          onClick={() => setView("list")}
          className="min-h-11 min-w-11 md:min-h-9 px-3 text-sm transition-colors aria-pressed:bg-muted"
        >
          {t.view.list}
        </button>
        <button
          type="button"
          role="tab"
          aria-pressed={view === "timeline"}
          onClick={() => setView("timeline")}
          className="min-h-11 min-w-11 md:min-h-9 px-3 text-sm transition-colors aria-pressed:bg-muted border-l border-border"
        >
          {t.view.timeline}
        </button>
      </div>

      {/* Clear buffer */}
      <button
        type="button"
        onClick={() => void clearBuffer()}
        className="min-h-11 min-w-11 md:min-h-9 md:min-w-9 rounded-md border border-border px-3 text-sm hover:bg-muted transition-colors"
      >
        {t.clearBuffer}
      </button>
    </div>
  );
}
