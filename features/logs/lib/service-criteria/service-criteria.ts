import type { LogCriteria, LogEntry } from "@/features/logs/lib/types/types";

export class ServiceCriteria implements LogCriteria {
  constructor(private readonly service: string) {}

  matches(entry: LogEntry): boolean {
    return entry.service === this.service;
  }
}
