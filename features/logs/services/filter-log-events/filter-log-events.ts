import "server-only";

import { FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { getCloudWatchLogsClient } from "@/features/logs/lib/client/client";
import { detectLevel } from "@/features/logs/lib/level/level";
import { mapLogGroupToService } from "@/features/logs/lib/service-map/service-map";
import type { LogEntry } from "@/features/logs/lib/types/types";

export type FilterLogEventsParams = {
  logGroupName?: string;
  startTime?: number;
  nextToken?: string;
};

export type FilterLogEventsResult = {
  entries: LogEntry[];
  nextToken?: string;
};

export async function filterLogEvents(
  params: FilterLogEventsParams,
): Promise<FilterLogEventsResult> {
  const client = await getCloudWatchLogsClient();
  const allEntries: LogEntry[] = [];
  let token: string | undefined = params.nextToken;

  do {
    const input: Record<string, unknown> = {};
    if (params.startTime !== undefined) input.startTime = params.startTime;
    if (params.logGroupName) input.logGroupName = params.logGroupName;
    if (token) input.nextToken = token;

    const res = await client.send(new FilterLogEventsCommand(input));

    for (const event of res.events ?? []) {
      const logGroupName = params.logGroupName ?? "";
      const entry: LogEntry = {
        id: event.eventId
          ? `${event.eventId}:${event.timestamp ?? Date.now()}`
          : `${event.logStreamName ?? ""}:${event.timestamp ?? Date.now()}:${Math.random()}`,
        timestamp: event.timestamp ?? Date.now(),
        message: event.message ?? "",
        level: detectLevel(event.message ?? ""),
        logGroupName,
        logStreamName: event.logStreamName ?? "",
        service: mapLogGroupToService(logGroupName),
      };
      allEntries.push(entry);
    }

    token = res.nextToken;
  } while (token);

  return { entries: allEntries, nextToken: undefined };
}
