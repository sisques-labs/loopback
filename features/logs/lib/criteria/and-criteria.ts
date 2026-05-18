import type { LogCriteria, LogEntry } from "./types";

export class AndCriteria implements LogCriteria {
  constructor(private readonly criteria: LogCriteria[]) {}

  matches(entry: LogEntry): boolean {
    return this.criteria.every((c) => c.matches(entry));
  }
}
