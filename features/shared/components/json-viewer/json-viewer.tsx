"use client";

import { CopyButton } from "@/features/shared/components/copy-button/copy-button";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  /** Raw string or object. If parseable JSON (object/array), will be pretty-printed. */
  value: string | object;
  /** Inline max-height for the pre container (e.g. "200px"). Default: "12rem" (≈48 lines). */
  maxHeight?: string;
  /** i18n label for the copy button idle state. */
  copyLabel: string;
  /** i18n label for the copy button after success. */
  copiedLabel: string;
  /** Optional empty-state placeholder. Default: "—". */
  emptyFallback?: string;
  className?: string;
}

function tryPretty(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.trim();
  if (trimmed[0] !== "{" && trimmed[0] !== "[") return raw;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return raw;
  }
}

function normalize(value: string | object): string {
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return tryPretty(value as string);
}

export function JsonViewer({
  value,
  maxHeight = "12rem",
  copyLabel,
  copiedLabel,
  emptyFallback = "—",
  className,
}: JsonViewerProps) {
  const rawStr = typeof value === "string" ? value : "";
  const display = rawStr === "" && typeof value === "string"
    ? emptyFallback
    : normalize(value);
  const hasValue = typeof value === "object" || (typeof value === "string" && value !== "");

  return (
    <div className={cn("relative rounded-lg border bg-muted", className)}>
      <pre
        role="code"
        className="overflow-auto px-3 py-2 font-mono text-xs"
        style={{ maxHeight }}
      >
        {display}
      </pre>
      {hasValue && (
        <div className="absolute right-1 top-1">
          <CopyButton
            value={display}
            size="sm"
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          />
        </div>
      )}
    </div>
  );
}
