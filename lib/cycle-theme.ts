const CYCLE: Record<string, string> = {
  system: "light",
  light: "dark",
  dark: "system",
};

/**
 * Returns the next theme in the cycle: system → light → dark → system.
 * Unknown inputs fall back to "system".
 */
export function cycleTheme(current: string): string {
  return CYCLE[current] ?? "system";
}
