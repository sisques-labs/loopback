"use server";

import "server-only";
import { filterLogEvents } from "@/features/logs/services/filter-log-events/filter-log-events";
import type { LogEntry } from "@/features/logs/lib/criteria/types";
import type { ActionState } from "@/features/shared/types/action-state";

export type LogEventsInput = {
  since: number;
  logGroupName?: string;
  nextToken?: string;
};

export type LogEventsData = {
  entries: LogEntry[];
  nextToken?: string;
};

export async function getLogEventsAction(
  input: LogEventsInput,
): Promise<ActionState<LogEventsData>> {
  try {
    const params: {
      startTime: number;
      logGroupName?: string;
      nextToken?: string;
    } = { startTime: input.since };

    if (input.logGroupName) params.logGroupName = input.logGroupName;
    if (input.nextToken) params.nextToken = input.nextToken;

    const result = await filterLogEvents(params);

    return {
      status: "success",
      data: {
        entries: result.entries,
        nextToken: result.nextToken,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch log events.";
    return { status: "error", message };
  }
}
