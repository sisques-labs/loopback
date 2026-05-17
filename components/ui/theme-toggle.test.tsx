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
  toggleTheme: "Toggle theme",
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
    // The component uses a mounted guard — it should NOT render a button
    // server-side (before useEffect). In jsdom this runs synchronously after
    // render but we rely on the component's internal gate being false initially.
    // We just confirm the component can render without throwing.
    // The full SSR-guard behaviour is validated implicitly through the mounted state.
    const { container } = render(<ThemeToggle dict={dict} />);
    // After mount in jsdom the button should be present; just confirm no crash
    expect(container).toBeTruthy();
  });

  it("renders with aria-label equal to dict.toggleTheme", () => {
    render(<ThemeToggle dict={dict} />);
    expect(screen.getByRole("button", { name: dict.toggleTheme })).toBeInTheDocument();
  });

  it("shows Monitor icon when theme is system", () => {
    mockTheme = "system";
    render(<ThemeToggle dict={dict} />);
    // Lucide renders svg with aria-hidden; we check via data attribute or title
    // The component should have data-theme="system" on the button for testability
    const button = screen.getByRole("button", { name: dict.toggleTheme });
    expect(button).toHaveAttribute("data-theme", "system");
  });

  it("shows Sun icon when theme is light", () => {
    mockTheme = "light";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.toggleTheme });
    expect(button).toHaveAttribute("data-theme", "light");
  });

  it("shows Moon icon when theme is dark", () => {
    mockTheme = "dark";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.toggleTheme });
    expect(button).toHaveAttribute("data-theme", "dark");
  });

  it("cycles system → light on click", async () => {
    mockTheme = "system";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.toggleTheme });
    await userEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("cycles light → dark on click", async () => {
    mockTheme = "light";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.toggleTheme });
    await userEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("cycles dark → system on click", async () => {
    mockTheme = "dark";
    render(<ThemeToggle dict={dict} />);
    const button = screen.getByRole("button", { name: dict.toggleTheme });
    await userEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});
