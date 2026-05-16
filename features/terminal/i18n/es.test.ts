import { describe, expect, it } from "vitest";
import es from "./es";

describe("Terminal Spanish copy", () => {
  it("ends underConstruction with a terminal period", () => {
    expect(es.underConstruction.endsWith(".")).toBe(true);
  });

  it("uses the expected experimental warning copy", () => {
    expect(es.underConstruction).toBe(
      "Esta función es experimental y los comandos pueden fallar.",
    );
  });
});
