import { useEffect } from "react";
import tinykeys from "tinykeys";
import { usePaletteStore } from "@/features/shared/stores/use-palette-store";

/**
 * Registers global keyboard shortcuts for the application.
 * Binds $mod+K (⌘K on macOS, Ctrl+K on Windows/Linux) to toggle the command palette.
 * The shortcut is ignored when focus is inside an input, textarea, or contenteditable element.
 * Cleans up on unmount — no leaked listeners.
 */
export function useAppShortcuts(): void {
  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      "$mod+KeyK": (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        const tagName = target.tagName?.toLowerCase();
        const isEditable =
          tagName === "input" ||
          tagName === "textarea" ||
          target.isContentEditable;

        if (isEditable) return;

        event.preventDefault();
        usePaletteStore.getState().toggle();
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
