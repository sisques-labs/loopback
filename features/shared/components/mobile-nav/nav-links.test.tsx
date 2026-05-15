import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavLinks } from "./nav-links";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

describe("NavLinks", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReset();
  });

  afterEach(() => {
    cleanup();
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
});
