import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock xterm packages before any import of the implementation
// ---------------------------------------------------------------------------
const mockTerminalWrite = vi.fn();
const mockTerminalClear = vi.fn();
const mockFitAddonFit = vi.fn();

vi.mock("@xterm/xterm", () => ({
  Terminal: vi.fn().mockImplementation(() => ({
    write: mockTerminalWrite,
    clear: mockTerminalClear,
    open: vi.fn(),
    loadAddon: vi.fn(),
    dispose: vi.fn(),
    onData: vi.fn(),
  })),
}));

vi.mock("@xterm/addon-fit", () => ({
  FitAddon: vi.fn().mockImplementation(() => ({
    fit: mockFitAddonFit,
    dispose: vi.fn(),
  })),
}));

// ---------------------------------------------------------------------------
// Mock next/dynamic so TerminalOutput renders as a simple div (no SSR guard)
// ---------------------------------------------------------------------------
vi.mock("next/dynamic", () => ({
  default: (_importFn: unknown, _opts: unknown) => {
    // Return a simple div acting as the terminal output container
    const MockOutput = ({ terminalRef }: { terminalRef?: React.RefObject<{ write: (t: string) => void; clear: () => void } | null> }) => {
      // Expose mock methods through the ref like the real implementation would
      if (terminalRef && "current" in terminalRef) {
        (terminalRef as React.MutableRefObject<{ write: (t: string) => void; clear: () => void } | null>).current = {
          write: mockTerminalWrite,
          clear: mockTerminalClear,
        };
      }
      return <div data-testid="terminal-output" />;
    };
    MockOutput.displayName = "MockTerminalOutput";
    return MockOutput;
  },
}));

// ---------------------------------------------------------------------------
// Fetch mock — returns a fake SSE stream
// ---------------------------------------------------------------------------
function makeFakeSSEResponse(events: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(event));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

// ---------------------------------------------------------------------------
// Import component under test AFTER all mocks are declared
// ---------------------------------------------------------------------------
import { TerminalPanel } from "./terminal-panel";

describe("TerminalPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("sends correct POST body on submit", async () => {
    const sseEvents = [
      "event: stdout\ndata: bucket-name\n\n",
      "event: exit\ndata: {\"code\":0}\n\n",
    ];
    vi.mocked(fetch).mockResolvedValueOnce(makeFakeSSEResponse(sseEvents));

    render(<TerminalPanel />);

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "awslocal s3 ls" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/terminal/execute",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ command: "awslocal", args: ["s3", "ls"] }),
        }),
      );
    });
  });

  it("submit is disabled while running", async () => {
    // Never resolve — keeps the command in running state
    vi.mocked(fetch).mockReturnValueOnce(new Promise(() => {}));

    render(<TerminalPanel />);

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "awslocal s3 ls" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(input).toBeDisabled();
    });
  });

  it("clear button calls terminal clear()", async () => {
    render(<TerminalPanel />);

    const clearBtn = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearBtn);

    expect(mockTerminalClear).toHaveBeenCalledTimes(1);
  });

  it("stderr lines are written with ANSI red escape", async () => {
    const sseEvents = [
      "event: stderr\ndata: some error\n\n",
      "event: exit\ndata: {\"code\":1}\n\n",
    ];
    vi.mocked(fetch).mockResolvedValueOnce(makeFakeSSEResponse(sseEvents));

    render(<TerminalPanel />);

    const input = screen.getByPlaceholderText("Enter command...");
    fireEvent.change(input, { target: { value: "awslocal s3 ls" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      const allCalls = mockTerminalWrite.mock.calls;
      const redCall = allCalls.find((args) =>
        (args[0] as string).includes("\x1b[31m"),
      );
      expect(redCall).toBeDefined();
      expect(redCall![0]).toContain("some error");
    });
  });
});
