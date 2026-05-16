"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { TerminalOutputHandle } from "./terminal-output";
import { TerminalInput } from "./terminal-input";

const TerminalOutput = dynamic(
  () =>
    import("./terminal-output").then((m) => ({ default: m.TerminalOutput })),
  { ssr: false },
);

export function TerminalPanel() {
  const terminalRef = useRef<TerminalOutputHandle | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function handleSubmit(value: string) {
    const argv = value.split(" ").filter(Boolean);
    const command = argv[0];
    const args = argv.slice(1);

    setIsRunning(true);
    terminalRef.current?.write(`\x1b[2m$ ${value}\x1b[0m\r\n`);

    try {
      const response = await fetch("/api/terminal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: argv }),
      });

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        terminalRef.current?.write(
          `\x1b[31mError: ${err.message ?? err.error ?? "Request failed"}\x1b[0m\r\n`,
        );
        setIsRunning(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;

        buffer += decoder.decode(chunk, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          parseSSEBlock(part);
        }
      }

      // Process any remaining buffer content
      if (buffer.trim()) {
        parseSSEBlock(buffer);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      terminalRef.current?.write(`\x1b[31mError: ${message}\x1b[0m\r\n`);
    } finally {
      setIsRunning(false);
    }
  }

  function parseSSEBlock(block: string) {
    let eventType = "";

    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        const data = line.slice(6);

        if (eventType === "stdout") {
          terminalRef.current?.write(data + "\r\n");
        } else if (eventType === "stderr") {
          terminalRef.current?.write(`\x1b[31m${data}\x1b[0m\r\n`);
        } else if (eventType === "exit") {
          setIsRunning(false);
        } else if (eventType === "error") {
          try {
            const parsed = JSON.parse(data) as { message: string };
            terminalRef.current?.write(
              `\x1b[31mError: ${parsed.message}\x1b[0m\r\n`,
            );
          } catch {
            terminalRef.current?.write(`\x1b[31mError: ${data}\x1b[0m\r\n`);
          }
        }

        eventType = "";
      }
    }
  }

  function handleClear() {
    terminalRef.current?.clear();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex-1 overflow-hidden">
        <TerminalOutput terminalRef={terminalRef} />
      </div>
      <TerminalInput
        isRunning={isRunning}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />
    </div>
  );
}
