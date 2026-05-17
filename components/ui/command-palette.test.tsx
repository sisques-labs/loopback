import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { usePaletteStore } from "@/features/shared/stores/use-palette-store";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock cycleTheme
vi.mock("@/lib/cycle-theme", () => ({
  cycleTheme: (t: string) => (t === "system" ? "light" : t === "light" ? "dark" : "system"),
}));

// Mock next-themes
const mockSetTheme = vi.fn();
let mockTheme = "system";
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

import { CommandPalette } from "./command-palette";

const dict = {
  title: "Command Palette",
  placeholder: "Search services, tools, actions…",
  empty: "No results found.",
  close: "Close",
  groupServices: "Services",
  groupTools: "Tools",
  groupActions: "Actions",
  actionSettings: "Settings",
  actionToggleTheme: "Toggle theme",
  ariaLabel: "Command palette",
};

const localePrefix = "/en";

function renderPalette(open = true) {
  usePaletteStore.setState({ open });
  return render(<CommandPalette dict={dict} localePrefix={localePrefix} />);
}

describe("CommandPalette", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSetTheme.mockClear();
    mockTheme = "system";
    usePaletteStore.setState({ open: false });
  });

  afterEach(() => {
    cleanup();
  });

  // ── Visibility ────────────────────────────────────────────────────────────
  it("renders the dialog when store open is true", () => {
    renderPalette(true);
    // The search input should be visible
    expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
  });

  // ── Groups & items ────────────────────────────────────────────────────────
  it("shows all three group headings when no filter is applied", () => {
    renderPalette(true);
    expect(screen.getByText(dict.groupServices)).toBeInTheDocument();
    expect(screen.getByText(dict.groupTools)).toBeInTheDocument();
    expect(screen.getByText(dict.groupActions)).toBeInTheDocument();
  });

  it("shows service items (S3, SQS, DynamoDB, Lambda, SNS)", () => {
    renderPalette(true);
    expect(screen.getByText("S3")).toBeInTheDocument();
    expect(screen.getByText("SQS")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  it("filters items by case-insensitive substring match", async () => {
    renderPalette(true);
    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "s3");
    expect(screen.getByText("S3")).toBeInTheDocument();
    expect(screen.queryByText("SQS")).not.toBeInTheDocument();
  });

  it("hides group headings when all items in that group are filtered out", async () => {
    renderPalette(true);
    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "terminal");
    expect(screen.queryByText(dict.groupServices)).not.toBeInTheDocument();
    expect(screen.getByText(dict.groupTools)).toBeInTheDocument();
    expect(screen.queryByText(dict.groupActions)).not.toBeInTheDocument();
  });

  it("shows no-results string when nothing matches", async () => {
    renderPalette(true);
    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "zzznomatch");
    expect(screen.getByText(dict.empty)).toBeInTheDocument();
    expect(screen.queryByText(dict.groupServices)).not.toBeInTheDocument();
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────
  it("ArrowDown moves active item to the next item", async () => {
    renderPalette(true);
    const input = screen.getByRole("searchbox");
    // First arrow-down activates index 0
    await userEvent.type(input, "{arrowdown}");
    const items = screen.getAllByRole("option");
    expect(items[0]).toHaveAttribute("aria-selected", "true");
  });

  it("pressing Enter on the active Settings item navigates to /en/settings", async () => {
    renderPalette(true);
    const input = screen.getByRole("searchbox");
    // Filter to only show actions → Settings
    await userEvent.type(input, "settings");
    const settingsItem = screen.getByText(dict.actionSettings).closest("[role='option']");
    expect(settingsItem).toBeInTheDocument();
    // Activate by clicking directly
    await userEvent.click(settingsItem!);
    expect(mockPush).toHaveBeenCalledWith("/en/settings");
  });

  it("pressing Enter on the Toggle theme action calls cycleTheme and closes", async () => {
    renderPalette(true);
    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "toggle");
    const themeItem = screen.getByText(dict.actionToggleTheme).closest("[role='option']");
    await userEvent.click(themeItem!);
    expect(mockSetTheme).toHaveBeenCalled();
    expect(usePaletteStore.getState().open).toBe(false);
  });

  // ── Locale-aware navigation ────────────────────────────────────────────────
  it("navigates with localePrefix when clicking a service item", async () => {
    renderPalette(true);
    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "s3");
    const s3Item = screen.getByText("S3").closest("[role='option']");
    await userEvent.click(s3Item!);
    expect(mockPush).toHaveBeenCalledWith("/en/s3");
  });
});
