"use client";

import { useState } from "react";

type Props = {
  isRunning: boolean;
  onSubmit: (value: string) => void;
  onClear: () => void;
};

export function TerminalInput({ isRunning, onSubmit, onClear }: Props) {
  const [value, setValue] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim() && !isRunning) {
      onSubmit(value.trim());
      setValue("");
    }
  }

  function handleRun() {
    if (value.trim() && !isRunning) {
      onSubmit(value.trim());
      setValue("");
    }
  }

  return (
    <div className="flex min-h-11 items-center gap-2 border-t border-border px-3 py-2">
      <input
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Enter command..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isRunning}
        aria-label="Terminal command input"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={handleRun}
        disabled={isRunning || !value.trim()}
        className="min-h-7 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Run
      </button>
      <button
        type="button"
        onClick={onClear}
        className="min-h-7 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Clear terminal"
      >
        Clear
      </button>
    </div>
  );
}
