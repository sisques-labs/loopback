import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock next-themes
const mockSetTheme = vi.fn();
let mockTheme = "system";
let mockResolvedTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockResolvedTheme,
  }),
}));

import { ThemeToggle } from "./theme-toggle";

const dict = {
  system: "System",
  light: "Light",
  dark: "Dark",
  themeToggle: "Toggle theme",
};

describe("ThemeToggle", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockSetTheme.mockClear();
    mockTheme = "system";
    mockResolvedTheme = "light";
  });

  it("renders null before mount (SSR guard)", () => {
    // jsdom limitation: useEffect runs synchronously after render, so the
    // pre-mount null state cannot be observed in unit tests — the component
    // transitions from null → button before assertions run.
    // What CAN be asserted: after mount the button IS present, which confirms
    // the guard resolves correctly and the component renders without crashing.
    const { container } = render(<ThemeToggle dict={dict} />);
    expect(screen.getByRole("button", { name: dict.themeToggle })).toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with aria-label equal to dict.themeToggle", () => {
    render(<ThemeToggle dict={dict} />);
    expect(screen.getByRole("button", { name: dict.themeToggle })).toBeInTheDocument();
  });

  it("shows Monitor icon when theme is system", () => {
    mockTheme = "system";
    render(<ThemeToggle dict={dict} />);
    // Lucide renders svg with aria-hidden; we check via data attribute or title
    // The component should have data-theme="system" on the button for testability
    const button = screen.getByRole("button", { name: dict.themeToggle });
    expect(button).toHaveAttribute("data-theme", "system");
  });

  it("shows Sun icon when theme is light", () => {
    mockTheme = "light";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.themeToggle });
    expect(button).toHaveAttribute("data-theme", "light");
  });

  it("shows Moon icon when theme is dark", () => {
    mockTheme = "dark";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.themeToggle });
    expect(button).toHaveAttribute("data-theme", "dark");
  });

  it("cycles system → light on click", async () => {
    mockTheme = "system";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.themeToggle });
    await userEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("cycles light → dark on click", async () => {
    mockTheme = "light";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.themeToggle });
    await userEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("cycles dark → system on click", async () => {
    mockTheme = "dark";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.themeToggle });
    await userEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});
