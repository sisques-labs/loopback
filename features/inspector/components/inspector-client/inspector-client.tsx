"use client";

import { useEffect, useMemo } from "react";
import { useInspectorStore } from "@/features/inspector/stores/use-inspector-store/use-inspector-store";
import { InspectorToolbar } from "@/features/inspector/components/inspector-toolbar/inspector-toolbar";
import { RequestList } from "@/features/inspector/components/request-list/request-list";
import type { RequestEntry } from "@/features/inspector/lib/types/types";
import type { InspectorDict } from "@/features/inspector/i18n/en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

// ── Types ──────────────────────────────────────────────────────────────────────

type ClientDict = Pick<
  WidenStringLiterals<InspectorDict>,
  "toolbar" | "empty" | "card" | "detail"
>;

type InspectorClientProps = {
  initialEntries: RequestEntry[];
  dict: ClientDict;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const SERVICES = ["SQS", "SNS", "S3", "Lambda", "DynamoDB", "CloudWatchLogs"];

// ── Component ─────────────────────────────────────────────────────────────────

export function InspectorClient({ initialEntries, dict }: InspectorClientProps) {
  const { entries, filters, seedEntries, startPolling, stopPolling } =
    useInspectorStore();

  // Mount: rehydrate → seed RSC entries → start polling
  useEffect(() => {
    void useInspectorStore.persist.rehydrate().then(() => {
      seedEntries(initialEntries);
      startPolling();
    });

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filter: pure derived state, no store mutation
  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (filters.service && entry.service !== filters.service) return false;
      if (filters.status !== "all" && entry.status !== filters.status) return false;
      if (filters.text) {
        const needle = filters.text.toLowerCase();
        const haystack = `${entry.operation} ${JSON.stringify(entry.input)} ${JSON.stringify(entry.output)}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [entries, filters]);

  return (
    <div className="flex flex-col gap-0 rounded-lg border border-border overflow-hidden">
      <InspectorToolbar dict={{ toolbar: dict.toolbar }} services={SERVICES} />
      <div className="p-3">
        <RequestList entries={filtered} />
      </div>
    </div>
  );
}
