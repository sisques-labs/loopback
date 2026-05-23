/**
 * Server-side ring buffer for AWS SDK request entries.
 *
 * Module-level state is intentional: the buffer acts as a process-scoped
 * singleton shared across all Server Action invocations. Node.js is single-
 * threaded per worker, so array mutations are safe without locks.
 *
 * No "server-only" import — keep this portable for unit tests.
 */
import type { RequestEntry } from "@/features/inspector/lib/types/types";

const BUFFER_CAP = 200;

let entries: RequestEntry[] = [];

/**
 * Appends an entry to the ring buffer.
 * If the buffer exceeds BUFFER_CAP entries after the push, the oldest
 * entries are evicted (FIFO) until the buffer is at capacity.
 */
export function pushEntry(entry: RequestEntry): void {
  entries.push(entry);
  if (entries.length > BUFFER_CAP) {
    entries = entries.slice(entries.length - BUFFER_CAP);
  }
}

/**
 * Returns a readonly snapshot of all buffered entries in insertion order.
 */
export function getEntries(): readonly RequestEntry[] {
  return entries;
}

/**
 * Clears all entries from the buffer.
 */
export function clearEntries(): void {
  entries = [];
}

/**
 * TEST-ONLY escape hatch — replaces the buffer contents wholesale.
 * Never call this in production code.
 */
export function __setEntries(next: RequestEntry[]): void {
  entries = next;
}
