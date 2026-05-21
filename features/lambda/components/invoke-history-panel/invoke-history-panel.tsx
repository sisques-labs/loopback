"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  useInvokeHistoryStore,
  selectEntriesForFunction,
} from "@/features/lambda/stores/use-invoke-history-store/use-invoke-history-store";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { InvokeHistoryEntry } from "@/features/lambda/types/lambda";

type Props = {
  functionName: string;
  dict: AppDict["lambda"]["invokeHistory"];
};

export function InvokeHistoryPanel({ functionName, dict }: Props) {
  // Subscribe only to the flat entries array filtered for this function.
  // We derive the slice in the selector and use a stable-id comparator so
  // Zustand skips re-renders when the set of IDs hasn't changed.
  const all = useInvokeHistoryStore((s) => s.entries);
  const entries = selectEntriesForFunction({ entries: all, addEntry: () => {}, clearHistory: () => {} }, functionName);
  const clearHistory = useInvokeHistoryStore.getState().clearHistory;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{dict.title}</h2>
        {entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => clearHistory(functionName)}
          >
            {dict.clearHistory}
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dict.empty}</p>
      ) : (
        <ScrollArea className="max-h-80">
          <div className="flex flex-col gap-2">
            {[...entries].reverse().map((entry) => (
              <InvokeHistoryEntryRow key={entry.id} entry={entry} dict={dict} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

type EntryProps = {
  entry: InvokeHistoryEntry;
  dict: AppDict["lambda"]["invokeHistory"];
};

function InvokeHistoryEntryRow({ entry, dict }: EntryProps) {
  const isError = !!entry.functionError;
  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className={`rounded-md border p-3 text-xs ${
        isError ? "border-destructive/30 bg-destructive/5" : "bg-muted/40"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>
          <span className="text-muted-foreground">{dict.statusLabel}: </span>
          <span
            className={`font-mono font-semibold ${
              entry.statusCode >= 400 || isError
                ? "text-destructive"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {entry.statusCode}
          </span>
        </span>
        <span>
          <span className="text-muted-foreground">{dict.durationLabel}: </span>
          <span className="font-mono">{entry.duration}ms</span>
        </span>
        <span>
          <span className="text-muted-foreground">{dict.payloadHashLabel}: </span>
          <span className="font-mono">{entry.payloadHash.slice(0, 8)}</span>
        </span>
        <span className="ml-auto text-muted-foreground">
          {dict.timestampLabel}: {time}
        </span>
      </div>
      {isError && (
        <div className="mt-2">
          <span className="font-semibold text-destructive">{dict.errorLabel}: </span>
          <span className="text-destructive/80">{entry.functionError}</span>
        </div>
      )}
    </div>
  );
}
