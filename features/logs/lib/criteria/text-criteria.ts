import type { LogCriteria, LogEntry } from "./types";

export class TextCriteria implements LogCriteria {
  constructor(private readonly query: string) {}

  matches(entry: LogEntry): boolean {
    const trimmed = this.query.trim();
    if (trimmed === "") return true;
    return entry.message.toLowerCase().includes(trimmed.toLowerCase());
  }
}
