import { describe, expect, it } from "vitest";
import { tools } from "./tools-registry";

describe("tools-registry", () => {
  it("exports a non-empty tools array", () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it("contains a terminal entry with href /terminal", () => {
    const terminal = tools.find((t) => t.id === "terminal");
    expect(terminal).toBeDefined();
    expect(terminal?.href).toBe("/terminal");
  });

  it("has no duplicate ids", () => {
    const ids = tools.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("tools-registry — timeline entry", () => {
  it("contains a timeline entry", () => {
    const entry = tools.find((t) => t.id === "timeline");
    expect(entry).toBeDefined();
  });

  it("timeline entry has correct href", () => {
    const entry = tools.find((t) => t.id === "timeline");
    expect(entry?.href).toBe("/timeline");
  });

  it("timeline entry has a label", () => {
    const entry = tools.find((t) => t.id === "timeline");
    expect(entry?.label).toBeTruthy();
    expect(typeof entry?.label).toBe("string");
  });

  it("timeline entry has an icon", () => {
    const entry = tools.find((t) => t.id === "timeline");
    // Lucide icons are forwardRef objects, not plain functions
    expect(entry?.icon).toBeDefined();
    expect(entry?.icon).not.toBeNull();
  });
});
