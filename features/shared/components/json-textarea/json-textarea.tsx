"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JsonTextareaProps {
  name: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  onValidityChange?: (valid: boolean) => void;
}

function tryFormat(input: string | undefined): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (trimmed[0] !== "{" && trimmed[0] !== "[") return input;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed === null || typeof parsed !== "object") return input;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return input;
  }
}

function getJsonError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed[0] !== "{" && trimmed[0] !== "[") return null;
  try {
    JSON.parse(trimmed);
    return null;
  } catch {
    return "Invalid JSON";
  }
}

export function JsonTextarea({
  name,
  defaultValue,
  label,
  placeholder,
  required,
  rows,
  onValidityChange,
}: JsonTextareaProps) {
  const [value, setValue] = useState(() => tryFormat(defaultValue));
  const error = getJsonError(value);

  useEffect(() => {
    onValidityChange?.(error === null);
  }, [error, onValidityChange]);

  function handleFormat() {
    setValue(JSON.stringify(JSON.parse(value), null, 2));
  }

  const id = `json-textarea-${name}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        aria-invalid={error !== null ? true : undefined}
        className="font-mono text-sm"
      />
      {error !== null && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!value.trim() || error !== null}
          onClick={handleFormat}
          className="text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Format JSON
        </button>
      </div>
    </div>
  );
}
