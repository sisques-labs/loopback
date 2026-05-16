"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";

export type TerminalOutputHandle = {
  write: (text: string) => void;
  clear: () => void;
};

type Props = {
  terminalRef: Ref<TerminalOutputHandle | null>;
};

export function TerminalOutput({ terminalRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useImperativeHandle(terminalRef, () => ({
    write: (text: string) => {
      termRef.current?.write(text);
    },
    clear: () => {
      termRef.current?.clear();
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const style = getComputedStyle(containerRef.current);
    const bg = style.getPropertyValue("--color-background").trim() || "#09090b";
    const fg = style.getPropertyValue("--color-foreground").trim() || "#fafafa";

    const term = new Terminal({
      disableStdin: true,
      convertEol: true,
      theme: { background: bg, foreground: fg },
      fontFamily: "var(--font-mono, monospace)",
      fontSize: 13,
      cursorBlink: false,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitRef.current = fitAddon;

    const observer = new ResizeObserver(() => {
      fitRef.current?.fit();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      fitAddon.dispose();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-md bg-background"
      data-testid="terminal-output"
    />
  );
}
