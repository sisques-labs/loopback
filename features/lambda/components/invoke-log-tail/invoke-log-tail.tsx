"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLogEventsAction } from "@/features/logs/use-cases/get-log-events";
import type { LogEntry } from "@/features/logs/lib/types/types";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

const POLL_INTERVAL_MS = 2_000;
const INITIAL_DELAY_MS = 500;
const MAX_POLL_DURATION_MS = 30_000;

type InvokeLogTailDict = AppDict["lambda"]["invokeLogTail"];

type Props = {
  functionName: string;
  /** Epoch ms — when the invoke was submitted */
  invokeTimestamp: number;
  dict: InvokeLogTailDict;
};

export function InvokeLogTail({ functionName, invokeTimestamp, dict }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [polling, setPolling] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [firstPollDone, setFirstPollDone] = useState(false);

  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const hasReceivedLogsRef = useRef(false);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    hasReceivedLogsRef.current = false;

    const logGroupName = `/aws/lambda/${functionName}`;

    async function poll() {
      if (stoppedRef.current) return;

      // Check 30s timeout from invokeTimestamp
      if (Date.now() - invokeTimestamp >= MAX_POLL_DURATION_MS) {
        stoppedRef.current = true;
        setPolling(false);
        return;
      }

      const result = await getLogEventsAction({ logGroupName, since: invokeTimestamp });

      if (stoppedRef.current) return;

      if (result.status === "success") {
        const newEntries = result.data.entries;

        if (newEntries.length > 0) {
          hasReceivedLogsRef.current = true;
          setLogs((prev) => [...prev, ...newEntries]);
        } else if (hasReceivedLogsRef.current) {
          // Drain condition: first empty poll after ≥1 non-empty poll
          stoppedRef.current = true;
          setPolling(false);
          clearInterval(intervalIdRef.current);
          return;
        }
      }

      setFirstPollDone(true);
    }

    const intervalIdRef = { current: undefined as ReturnType<typeof setInterval> | undefined };

    const timeoutId = setTimeout(() => {
      // Immediately register interval so it doesn't depend on poll() resolution
      intervalIdRef.current = setInterval(() => {
        void poll();
      }, POLL_INTERVAL_MS);

      // Fire first poll synchronously relative to this callback
      void poll();
    }, INITIAL_DELAY_MS);

    return () => {
      stoppedRef.current = true;
      clearTimeout(timeoutId);
      if (intervalIdRef.current !== undefined) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [functionName, invokeTimestamp]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (!autoScroll || !scrollViewportRef.current) return;
    scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
  }, [logs, autoScroll]);

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{dict.title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoScroll((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground"
            aria-pressed={autoScroll}
          >
            {dict.autoScroll}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? dict.collapse : dict.expand}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            {polling ? dict.polling : dict.done}
          </p>

          {firstPollDone && logs.length === 0 && (
            <p className="text-xs text-muted-foreground">{dict.noLogs}</p>
          )}

          {logs.length > 0 && (
            <ScrollArea className="max-h-64">
              <div ref={scrollViewportRef} className="flex flex-col gap-0.5 font-mono text-xs">
                {logs.map((entry) => (
                  <div key={entry.id} className="whitespace-pre-wrap break-all py-0.5">
                    {entry.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
