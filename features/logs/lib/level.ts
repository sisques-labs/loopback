import type { LogLevel } from "./criteria/types";

export function detectLevel(message: string): LogLevel {
  const m = /\b(ERROR|ERR|FATAL|WARN(?:ING)?|INFO|DEBUG|TRACE)\b/i.exec(message);
  if (!m) return "unknown";
  const t = m[1].toUpperCase();
  if (t.startsWith("ERR") || t === "FATAL") return "error";
  if (t.startsWith("WARN")) return "warn";
  if (t === "INFO") return "info";
  return "unknown"; // DEBUG/TRACE collapse to unknown
}
