/** Formats epoch milliseconds as a locale-aware 24-hour time (HH:MM:SS). */
export function formatTimestamp(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
