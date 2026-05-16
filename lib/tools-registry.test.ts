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
