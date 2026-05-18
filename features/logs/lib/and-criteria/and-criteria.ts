import type { LogCriteria, LogEntry } from "@/features/logs/lib/types/types";

export class AndCriteria implements LogCriteria {
  constructor(private readonly criteria: LogCriteria[]) {}

  matches(entry: LogEntry): boolean {
    return this.criteria.every((c) => c.matches(entry));
  }
}
