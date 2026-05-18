/** Formats milliseconds since `lastUpdatedAt` as a compact elapsed string (e.g. `30s`, `2m`). */
export function formatElapsed(lastUpdatedAt: number, now: number = Date.now()): string {
  const seconds = Math.floor((now - lastUpdatedAt) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}
