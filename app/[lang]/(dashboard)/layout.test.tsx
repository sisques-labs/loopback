import { describe, expect, it, vi } from "vitest";

// Mock all server/client deps before importing the modules under test
vi.mock("@/features/shared/stores/use-palette-store", () => ({
  usePaletteStore: Object.assign(vi.fn(() => ({ open: false })), { getState: vi.fn(() => ({ toggle: vi.fn(), setOpen: vi.fn() })) }),
}));
vi.mock("@/features/shared/hooks/use-app-shortcuts", () => ({
  useAppShortcuts: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
}));
vi.mock("tinykeys", () => ({ default: vi.fn(() => vi.fn()) }));

import { getDictionary } from "@/features/shared/i18n/get-dictionary";

describe("DashboardLayout integration", () => {
  // T4.1 — verify all dict keys required by layout are present

  it("getDictionary('en') has shared.themeToggle keys for ThemeToggle rightSlot", () => {
    const dict = getDictionary("en");
    expect(dict.shared.themeToggle.themeToggle).toBeDefined();
    expect(dict.shared.themeToggle.system).toBeDefined();
    expect(dict.shared.themeToggle.light).toBeDefined();
    expect(dict.shared.themeToggle.dark).toBeDefined();
  });

  it("getDictionary('en') has shared.commandPalette keys for DashboardClientShell", () => {
    const dict = getDictionary("en");
    expect(dict.shared.commandPalette.placeholder).toBeDefined();
    expect(dict.shared.commandPalette.ariaLabel).toBeDefined();
    expect(dict.shared.commandPalette.groupServices).toBeDefined();
    expect(dict.shared.commandPalette.groupTools).toBeDefined();
    expect(dict.shared.commandPalette.groupActions).toBeDefined();
  });

  it("getDictionary('es') has shared.themeToggle keys for ThemeToggle rightSlot", () => {
    const dict = getDictionary("es");
    expect(dict.shared.themeToggle.themeToggle).toBeDefined();
  });

  it("getDictionary('es') has shared.commandPalette keys for DashboardClientShell", () => {
    const dict = getDictionary("es");
    expect(dict.shared.commandPalette.ariaLabel).toBeDefined();
  });

  // T4.2 — i18n smoke test: all new keys exist in both locales

  it("T4.2 — en.ts has all new settings keys (themeTitle, shortcutsTitle, shortcutOpenPalette, shortcutCmdK)", () => {
    const dict = getDictionary("en");
    const s = dict.shared.settings;
    expect(s.themeTitle).toBe("Appearance");
    expect(s.themeDescription).toBe("Choose your preferred color scheme.");
    expect(s.shortcutsTitle).toBe("Keyboard Shortcuts");
    expect(s.shortcutOpenPalette).toBe("Open command palette");
    expect(s.shortcutCmdK).toBe("⌘K / Ctrl+K");
  });

  it("T4.2 — es.ts has all new settings keys (themeTitle, shortcutsTitle, shortcutOpenPalette, shortcutCmdK)", () => {
    const dict = getDictionary("es");
    const s = dict.shared.settings;
    expect(s.themeTitle).toBe("Apariencia");
    expect(s.themeDescription).toBe("Elige tu esquema de colores preferido.");
    expect(s.shortcutsTitle).toBe("Atajos de teclado");
    expect(s.shortcutOpenPalette).toBe("Abrir paleta de comandos");
    expect(s.shortcutCmdK).toBe("⌘K / Ctrl+K");
  });

  it("T4.2 — en.ts themeToggle aria-label is 'Toggle theme'", () => {
    const dict = getDictionary("en");
    expect(dict.shared.themeToggle.themeToggle).toBe("Toggle theme");
  });

  it("T4.2 — es.ts themeToggle aria-label is 'Cambiar tema'", () => {
    const dict = getDictionary("es");
    expect(dict.shared.themeToggle.themeToggle).toBe("Cambiar tema");
  });

  it("T4.2 — en.ts commandPalette ariaLabel is 'Command palette'", () => {
    const dict = getDictionary("en");
    expect(dict.shared.commandPalette.ariaLabel).toBe("Command palette");
  });

  it("T4.2 — es.ts commandPalette ariaLabel is 'Paleta de comandos'", () => {
    const dict = getDictionary("es");
    expect(dict.shared.commandPalette.ariaLabel).toBe("Paleta de comandos");
  });
});
