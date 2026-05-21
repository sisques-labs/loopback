import type { TimelineTimeRange } from "../types/types";

const HOUR_MS = 60 * 60 * 1000;

export function mapTimeRangeToStartTime(
  range: TimelineTimeRange,
  now: number = Date.now(),
): number {
  switch (range) {
    case "1h":
      return now - 1 * HOUR_MS;
    case "6h":
      return now - 6 * HOUR_MS;
    case "24h":
      return now - 24 * HOUR_MS;
    case "all":
      return 0; // CloudWatch interprets 0 as "from beginning"
  }
}
