import type { LogCriteria, LogEntry, LogLevel } from "./types";

export class LevelCriteria implements LogCriteria {
  constructor(private readonly level: LogLevel) {}

  matches(entry: LogEntry): boolean {
    return entry.level === this.level;
  }
}
