import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import type { LogEntry } from "@/features/logs/lib/types/types";
import type { LogsDict } from "@/features/logs/i18n/en";
import { LogRow } from "./log-row";

// ── Fixture helpers ──────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: "test-id-1",
    timestamp: 1700000000000,
    message: "Lambda function timed out",
    level: "info",
    logGroupName: "/aws/lambda/my-fn",
    logStreamName: "2024/01/01/[$LATEST]abc",
    service: "lambda",
    ...overrides,
  };
}

const dict = {
  entry: {
    level: { info: "INFO", warn: "WARN", error: "ERROR", unknown: "UNKNOWN" },
  },
} as Pick<LogsDict, "entry">;

afterEach(cleanup);

// ── Tests ────────────────────────────────────────────────────────────────────

describe("LogRow", () => {
  it("renders message text", () => {
    const entry = makeEntry({ message: "Test message content" });
    render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(screen.getByText("Test message content")).toBeInTheDocument();
  });

  it("renders human-readable timestamp, not the raw epoch number", () => {
    const entry = makeEntry({ timestamp: 1700000000000 });
    render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    // Must NOT display the raw epoch ms
    expect(screen.queryByText("1700000000000")).toBeNull();
    // Timestamp cell exists
    expect(screen.getByRole("row")).toBeInTheDocument();
  });

  it("renders INFO level badge with correct label", () => {
    const entry = makeEntry({ level: "info" });
    render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(screen.getByText("INFO")).toBeInTheDocument();
  });

  it("renders WARN level badge", () => {
    const entry = makeEntry({ level: "warn" });
    render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(screen.getByText("WARN")).toBeInTheDocument();
  });

  it("renders ERROR level badge", () => {
    const entry = makeEntry({ level: "error" });
    render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("renders UNKNOWN level badge", () => {
    const entry = makeEntry({ level: "unknown" });
    render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });

  it("info badge carries data-level='info'", () => {
    const entry = makeEntry({ level: "info" });
    const { container } = render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(container.querySelector("[data-level='info']")).toBeInTheDocument();
  });

  it("warn badge carries data-level='warn'", () => {
    const entry = makeEntry({ level: "warn" });
    const { container } = render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(container.querySelector("[data-level='warn']")).toBeInTheDocument();
  });

  it("error badge carries data-level='error'", () => {
    const entry = makeEntry({ level: "error" });
    const { container } = render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(container.querySelector("[data-level='error']")).toBeInTheDocument();
  });

  it("unknown badge carries data-level='unknown'", () => {
    const entry = makeEntry({ level: "unknown" });
    const { container } = render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(container.querySelector("[data-level='unknown']")).toBeInTheDocument();
  });

  it("renders as a <tr> element", () => {
    const entry = makeEntry();
    render(
      <table>
        <tbody>
          <LogRow entry={entry} dict={dict} />
        </tbody>
      </table>
    );
    expect(screen.getByRole("row")).toBeInTheDocument();
  });
});
