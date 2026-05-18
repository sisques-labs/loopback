"use client";

import { useAppShortcuts } from "@/features/shared/hooks/use-app-shortcuts";
import { CommandPalette, type CommandPaletteDict } from "@/components/ui/command-palette";

type DashboardClientShellProps = {
  paletteDict: CommandPaletteDict;
  localePrefix: string;
};

/**
 * Thin "use client" island that:
 * 1. Mounts the useAppShortcuts effect (keyboard bindings)
 * 2. Renders the CommandPalette portal
 *
 * Renders null for its own layout — all output goes into Dialog portals.
 */
export function DashboardClientShell({ paletteDict, localePrefix }: DashboardClientShellProps) {
  useAppShortcuts();

  return (
    <CommandPalette dict={paletteDict} localePrefix={localePrefix} />
  );
}
