"use client";

import { useEffect } from "react";
import { useTimelineStore } from "../../stores/use-timeline-store/use-timeline-store";
import { TimelineToolbar } from "../timeline-toolbar/timeline-toolbar";
import { TimelineList } from "../timeline-list/timeline-list";
import { TimelineEmpty } from "../timeline-empty/timeline-empty";
import { TimelineSkeleton } from "../timeline-skeleton/timeline-skeleton";
import type { TimelineEvent, TimelineTimeRange } from "../../lib/types/types";

// ── Inline dict (fallback — real dict is passed from RSC page after PR-3) ──────

const INLINE_DICT = {
  toolbar: {
    timeRange: {
      label: "Time range",
      "1h": "Last hour",
      "6h": "Last 6 hours",
      "24h": "Last 24 hours",
      all: "All time",
    },
    statusPolling: "Polling",
    statusError: "Error",
    statusIdle: "Idle",
    lastUpdated: "Updated {time}",
  },
  empty: {
    title: "No events found",
    body: "No events were found for the selected time range. Make sure LocalStack is running and services are being invoked.",
  },
};

// ── Types ──────────────────────────────────────────────────────────────────────

type TimelineClientDict = typeof INLINE_DICT;

type TimelineClientProps = {
  initialEvents: TimelineEvent[];
  dict?: TimelineClientDict;
};

// ── Component ──────────────────────────────────────────────────────────────────

export function TimelineClient({ initialEvents, dict = INLINE_DICT }: TimelineClientProps) {
  // ── Selectors (one per slice to minimise re-renders) ──
  const events = useTimelineStore((s) => s.events);
  const status = useTimelineStore((s) => s.status);
  const timeRange = useTimelineStore((s) => s.timeRange);
  const lastUpdatedAt = useTimelineStore((s) => s.lastUpdatedAt);
  const setTimeRange = useTimelineStore((s) => s.setTimeRange);
  const seedEvents = useTimelineStore((s) => s.seedEvents);
  const startPolling = useTimelineStore((s) => s.startPolling);
  const stopPolling = useTimelineStore((s) => s.stopPolling);

  // ── Lifecycle ──────────────────────────────────────────
  useEffect(() => {
    seedEvents(initialEvents);
    startPolling();
    return () => {
      stopPolling();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ──────────────────────────────────────
  const showSkeleton = events.length === 0 && lastUpdatedAt === null;
  const showEmpty = events.length === 0 && lastUpdatedAt !== null;

  // ── Handlers ───────────────────────────────────────────
  function handleTimeRangeChange(range: TimelineTimeRange) {
    setTimeRange(range);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <TimelineToolbar
        dict={dict}
        status={status}
        lastUpdatedAt={lastUpdatedAt}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />

      {/* Content area */}
      {showSkeleton ? (
        <TimelineSkeleton count={5} />
      ) : showEmpty ? (
        <TimelineEmpty dict={dict} />
      ) : (
        <TimelineList events={events} />
      )}
    </div>
  );
}
