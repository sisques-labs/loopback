import { describe, expect, it } from "vitest";
import { cycleTheme } from "./cycle-theme";

describe("cycleTheme", () => {
  it("cycles system → light", () => {
    expect(cycleTheme("system")).toBe("light");
  });

  it("cycles light → dark", () => {
    expect(cycleTheme("light")).toBe("dark");
  });

  it("cycles dark → system", () => {
    expect(cycleTheme("dark")).toBe("system");
  });

  it("unknown input returns system", () => {
    expect(cycleTheme("anything-else")).toBe("system");
  });
});
