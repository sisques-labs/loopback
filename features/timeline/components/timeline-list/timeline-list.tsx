import { TimelineCard } from "../timeline-card/timeline-card";
import type { TimelineEvent } from "../../lib/types/types";

// ── Types ──────────────────────────────────────────────────────────────────────

type TimelineListProps = {
  events: TimelineEvent[];
};

// ── Component ──────────────────────────────────────────────────────────────────

export function TimelineList({ events }: TimelineListProps) {
  return (
    <div className="flex flex-col">
      {events.map((event) => (
        <TimelineCard key={event.eventId} event={event} />
      ))}
    </div>
  );
}
