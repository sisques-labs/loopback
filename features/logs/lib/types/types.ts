export type LogLevel = "info" | "warn" | "error" | "unknown";

export interface LogEntry {
  id: string;
  timestamp: number; // epoch ms
  message: string;
  level: LogLevel;
  logGroupName: string;
  logStreamName: string;
  service: string;
}

export type LogFilters = {
  service: string;
  level: LogLevel | "all";
  text: string;
};

export interface LogCriteria {
  matches(entry: LogEntry): boolean;
}
