import { describe, beforeEach, expect, it } from "vitest";
import { usePaletteStore } from "./use-palette-store";

describe("usePaletteStore", () => {
  beforeEach(() => {
    usePaletteStore.setState({ open: false });
  });

  it("initialises with open = false", () => {
    expect(usePaletteStore.getState().open).toBe(false);
  });

  it("setOpen(true) sets open to true", () => {
    usePaletteStore.getState().setOpen(true);
    expect(usePaletteStore.getState().open).toBe(true);
  });

  it("setOpen(false) sets open to false", () => {
    usePaletteStore.setState({ open: true });
    usePaletteStore.getState().setOpen(false);
    expect(usePaletteStore.getState().open).toBe(false);
  });

  it("toggle flips open from false to true", () => {
    usePaletteStore.getState().toggle();
    expect(usePaletteStore.getState().open).toBe(true);
  });

  it("toggle flips open from true to false", () => {
    usePaletteStore.setState({ open: true });
    usePaletteStore.getState().toggle();
    expect(usePaletteStore.getState().open).toBe(false);
  });
});
