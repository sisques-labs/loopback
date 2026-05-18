import { describe, expect, it } from "vitest";
import { detectLevel } from "./level";

describe("detectLevel", () => {
  it("returns 'error' for message containing ERROR", () => {
    expect(detectLevel("ERROR: connection refused")).toBe("error");
  });

  it("returns 'error' for message containing ERR", () => {
    expect(detectLevel("ERR something went wrong")).toBe("error");
  });

  it("returns 'error' for message containing FATAL", () => {
    expect(detectLevel("FATAL: unrecoverable failure")).toBe("error");
  });

  it("returns 'warn' for message containing WARN", () => {
    expect(detectLevel("WARN: disk usage high")).toBe("warn");
  });

  it("returns 'warn' for message containing WARNING", () => {
    expect(detectLevel("WARNING: retry limit approaching")).toBe("warn");
  });

  it("returns 'info' for message containing INFO", () => {
    expect(detectLevel("INFO: server started")).toBe("info");
  });

  it("returns 'unknown' for message with no recognized token", () => {
    expect(detectLevel("some random log message")).toBe("unknown");
  });

  it("returns 'unknown' for DEBUG (collapse to unknown bucket)", () => {
    expect(detectLevel("DEBUG: variable value is 42")).toBe("unknown");
  });

  it("returns 'unknown' for TRACE (collapse to unknown bucket)", () => {
    expect(detectLevel("TRACE: entering function")).toBe("unknown");
  });

  it("is case-insensitive", () => {
    expect(detectLevel("error: something broke")).toBe("error");
    expect(detectLevel("warn: watch out")).toBe("warn");
    expect(detectLevel("info: all good")).toBe("info");
  });

  it("does NOT match INFORMATION as INFO (word-boundary)", () => {
    expect(detectLevel("INFORMATION about the system")).toBe("unknown");
  });

  it("handles empty string", () => {
    expect(detectLevel("")).toBe("unknown");
  });
});
