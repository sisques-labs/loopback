"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  /** The text to write to the clipboard. */
  value: string;
  /** Optional visible label after the icon. If omitted, button is icon-only. */
  label?: string;
  /** Tooltip + aria-label when idle. Required for a11y. */
  copyLabel: string;
  /** Tooltip + aria-label after success. */
  copiedLabel: string;
  /** "sm" = compact, for table cells. "default" = standard. */
  size?: "sm" | "default";
  className?: string;
}

export function CopyButton({
  value,
  label,
  copyLabel,
  copiedLabel,
  size = "default",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // Effect owns the timeout and handles cleanup on unmount.
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        console.warn("[CopyButton] clipboard unavailable, falling back to execCommand");
        // Fallback for HTTP localhost / older browsers
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
    } catch {
      // Silently fail — do NOT toast, don't break the page.
    }
  }, [value]);

  const Icon = copied ? Check : Copy;
  const aria = copied ? copiedLabel : copyLabel;

  return (
    <Button
      type="button"
      variant="ghost"
      size={size === "sm" ? "icon-xs" : "icon-sm"}
      className={cn(
        // >=44x44px touch target on mobile per AGENTS.md
        size === "sm"
          ? "min-h-11 min-w-11 md:min-h-7 md:min-w-7"
          : "min-h-11 min-w-11 md:min-h-8 md:min-w-8",

        className,
      )}
      aria-label={aria}
      title={aria}
      onClick={copy}
    >
      <Icon aria-hidden="true" />
      {label && <span className="ml-1.5 text-xs">{label}</span>}
    </Button>
  );
}
