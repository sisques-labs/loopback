"use server";

import "server-only";

import { filterLogEvents } from "@/features/logs/services/filter-log-events/filter-log-events";
import { mapLogEntryToTimelineEvent } from "../../lib/event-mapper/event-mapper";
import { mapTimeRangeToStartTime } from "../../lib/time-range/time-range";
import type { TimelineEvent, TimelineTimeRange } from "../../lib/types/types";
import type { ActionState } from "@/features/shared/types/action-state";

export type GetTimelineEventsInput = {
  timeRange: TimelineTimeRange;
};

export type GetTimelineEventsData = {
  events: TimelineEvent[];
};

export async function getTimelineEventsAction(
  input: GetTimelineEventsInput,
): Promise<ActionState<GetTimelineEventsData>> {
  try {
    const startTime = mapTimeRangeToStartTime(input.timeRange);

    const result = await filterLogEvents({ startTime });

    const events = result.entries
      .map(mapLogEntryToTimelineEvent)
      .sort((a, b) => b.timestamp - a.timestamp);

    return { status: "success", data: { events } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch timeline events.";
    return { status: "error", message };
  }
}
