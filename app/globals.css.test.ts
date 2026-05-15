import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("app/globals.css typography tokens", () => {
  const css = readFileSync(resolve(__dirname, "globals.css"), "utf8");

  it("maps --font-sans to Geist without circular reference", () => {
    expect(css).toContain("--font-sans: var(--font-geist-sans)");
    expect(css).not.toMatch(/--font-sans:\s*var\(--font-sans\)/);
  });

  it("maps --font-mono to Geist Mono", () => {
    expect(css).toContain("--font-mono: var(--font-geist-mono)");
  });
});
