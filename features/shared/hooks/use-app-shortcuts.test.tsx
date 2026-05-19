import { describe, beforeEach, afterEach, expect, it, vi } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { usePaletteStore } from "@/features/shared/stores/use-palette-store";

type ShortcutBindings = Record<string, (event: KeyboardEvent) => void>;

// Use vi.hoisted so variables are available inside vi.mock factory
const { mockUnsubscribe, mockTinykeys } = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn();
  const mockTinykeys = vi.fn(
    (_target: Window, _bindings: ShortcutBindings) => mockUnsubscribe,
  );
  return { mockUnsubscribe, mockTinykeys };
});

vi.mock("tinykeys", () => ({
  tinykeys: mockTinykeys,
}));

// Import AFTER mocks are defined
import { useAppShortcuts } from "./use-app-shortcuts";

function getShortcutBindings(): ShortcutBindings {
  expect(mockTinykeys).toHaveBeenCalled();
  return mockTinykeys.mock.calls[0][1];
}

describe("useAppShortcuts", () => {
  beforeEach(() => {
    mockTinykeys.mockClear();
    mockUnsubscribe.mockClear();
    usePaletteStore.setState({ open: false });
  });

  afterEach(() => {
    cleanup();
  });

  it("registers a tinykeys listener on window on mount", () => {
    renderHook(() => useAppShortcuts());
    expect(mockTinykeys).toHaveBeenCalledWith(
      window,
      expect.objectContaining({ "$mod+KeyK": expect.any(Function) })
    );
  });

  it("removes the listener on unmount", () => {
    const { unmount } = renderHook(() => useAppShortcuts());
    expect(mockUnsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("calls store toggle when $mod+KeyK fires (non-input target)", () => {
    renderHook(() => useAppShortcuts());
    expect(mockTinykeys).toHaveBeenCalledTimes(1);

    const handler = getShortcutBindings()["$mod+KeyK"];
    expect(handler).toBeDefined();

    // Simulate keydown on a non-input element (body)
    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
    Object.defineProperty(event, "target", { value: document.body });
    handler(event);

    expect(usePaletteStore.getState().open).toBe(true);
  });

  it("does NOT call store toggle when target is an input element", () => {
    renderHook(() => useAppShortcuts());

    const handler = getShortcutBindings()["$mod+KeyK"];

    const input = document.createElement("input");
    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
    Object.defineProperty(event, "target", { value: input });
    handler(event);

    expect(usePaletteStore.getState().open).toBe(false);
  });

  it("does NOT call store toggle when target is a textarea element", () => {
    renderHook(() => useAppShortcuts());

    const handler = getShortcutBindings()["$mod+KeyK"];

    const textarea = document.createElement("textarea");
    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
    Object.defineProperty(event, "target", { value: textarea });
    handler(event);

    expect(usePaletteStore.getState().open).toBe(false);
  });
});
