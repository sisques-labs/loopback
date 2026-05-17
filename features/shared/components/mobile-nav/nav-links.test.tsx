import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavLinks } from "./nav-links";
import type { ToolEntry } from "@/features/shared/types/service-entry";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const mockTools = vi.hoisted<ToolEntry[]>(() => []);
vi.mock("@/lib/tools-registry", () => ({
  get tools() { return mockTools; },
}));

import { usePathname } from "next/navigation";

describe("NavLinks", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders dashboard home link and marks it active on /en/dashboard", () => {
    vi.mocked(usePathname).mockReturnValue("/en/dashboard");

    render(
      <NavLinks localePrefix="/en" dashboardLinkLabel="Dashboard" />,
    );

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).toHaveAttribute("href", "/en/dashboard");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
    expect(dashboardLink.className).toContain("bg-sidebar-primary");
  });

  it("renders dashboard link inactive when on a service route", () => {
    vi.mocked(usePathname).mockReturnValue("/en/s3");

    render(
      <NavLinks
        localePrefix="/en"
        dashboardLinkLabel="Dashboard"
        servicesLabel="Services"
      />,
    );

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).not.toHaveAttribute("aria-current");
    expect(dashboardLink.className).not.toContain("bg-sidebar-primary");
  });

  it("marks the active service link with sidebar-primary pill and aria-current", () => {
    vi.mocked(usePathname).mockReturnValue("/en/s3");

    render(
      <NavLinks
        localePrefix="/en"
        servicesLabel="Services"
        settingsSectionLabel="Configuration"
        settingsLinkLabel="Settings"
      />,
    );

    const s3Link = screen.getByRole("link", { name: "S3" });
    expect(s3Link).toHaveAttribute("aria-current", "page");
    expect(s3Link.className).toContain("bg-sidebar-primary");
    expect(s3Link.className).toContain("text-sidebar-primary-foreground");

    const sqsLink = screen.getByRole("link", { name: "SQS" });
    expect(sqsLink).not.toHaveAttribute("aria-current");
    expect(sqsLink.className).not.toContain("bg-sidebar-primary");
  });

  it("marks settings as active on the settings route", () => {
    vi.mocked(usePathname).mockReturnValue("/en/settings");

    render(
      <NavLinks
        localePrefix="/en"
        settingsSectionLabel="Configuration"
        settingsLinkLabel="Settings"
      />,
    );

    const settingsLink = screen.getByRole("link", {
      name: "Settings",
      current: "page",
    });
    expect(settingsLink.className).toContain("bg-sidebar-primary");
    expect(screen.getByRole("link", { name: "S3" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  describe("Tools section", () => {
    const terminalTool: ToolEntry = {
      id: "terminal",
      label: "Terminal",
      href: "/terminal",
      icon: (() => null) as unknown as ToolEntry["icon"],
    };

    beforeEach(() => {
      mockTools.length = 0;
    });

    it("renders Tools section and terminal link when toolsSectionLabel provided and registry has tools", () => {
      vi.mocked(usePathname).mockReturnValue("/en/s3");
      mockTools.push(terminalTool);

      render(
        <NavLinks localePrefix="/en" toolsSectionLabel="Tools" />,
      );

      expect(screen.getByText("Tools")).toBeDefined();
      expect(screen.getByRole("link", { name: "Terminal" })).toBeDefined();
    });

    it("does not render Tools section when toolsSectionLabel is omitted", () => {
      vi.mocked(usePathname).mockReturnValue("/en/s3");
      mockTools.push(terminalTool);

      render(<NavLinks localePrefix="/en" />);

      expect(screen.queryByText("Tools")).toBeNull();
      expect(screen.queryByRole("link", { name: "Terminal" })).toBeNull();
    });

    it("does not render Tools section when registry is empty", () => {
      vi.mocked(usePathname).mockReturnValue("/en/s3");

      render(
        <NavLinks localePrefix="/en" toolsSectionLabel="Tools" />,
      );

      expect(screen.queryByText("Tools")).toBeNull();
    });

    it("marks terminal link active with aria-current and pill classes on /en/terminal", () => {
      vi.mocked(usePathname).mockReturnValue("/en/terminal");
      mockTools.push(terminalTool);

      render(
        <NavLinks localePrefix="/en" toolsSectionLabel="Tools" />,
      );

      const link = screen.getByRole("link", { name: "Terminal" });
      expect(link).toHaveAttribute("aria-current", "page");
      expect(link.className).toContain("bg-sidebar-primary");
      expect(link.className).toContain("text-sidebar-primary-foreground");
    });

    it("terminal link is inactive on /en/s3", () => {
      vi.mocked(usePathname).mockReturnValue("/en/s3");
      mockTools.push(terminalTool);

      render(
        <NavLinks localePrefix="/en" toolsSectionLabel="Tools" />,
      );

      const link = screen.getByRole("link", { name: "Terminal" });
      expect(link).not.toHaveAttribute("aria-current");
      expect(link.className).toContain("text-sidebar-foreground");
    });
  });
});
