/**
 * T36 — Smoke test: cloudwatch-logs entry in the services registry
 * and that NavLinks renders it in the sidebar navigation.
 *
 * Closes #69 (navigation entry).
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/en/cloudwatch-logs"),
}));

// Tools registry — empty for this smoke test
vi.mock("@/lib/tools-registry", () => ({
  tools: [],
}));

import { NavLinks } from "@/features/shared/components/mobile-nav/nav-links";
import { services } from "@/lib/services-registry";

afterEach(cleanup);

describe("cloudwatch-logs navigation smoke test", () => {
  it("services registry contains the cloudwatch-logs slug", () => {
    const entry = services.find((s) => s.slug === "cloudwatch-logs");
    expect(entry).toBeDefined();
    expect(entry?.label).toBe("CloudWatch Logs");
    expect(entry?.href).toBe("/cloudwatch-logs");
    expect(entry?.status).toBe("enabled");
  });

  it("NavLinks renders a 'CloudWatch Logs' link", () => {
    render(<NavLinks localePrefix="/en" servicesLabel="Services" />);
    const link = screen.getByRole("link", { name: "CloudWatch Logs" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/en/cloudwatch-logs");
  });

  it("CloudWatch Logs link is active on the cloudwatch-logs route", () => {
    render(<NavLinks localePrefix="/en" servicesLabel="Services" />);
    const link = screen.getByRole("link", { name: "CloudWatch Logs" });
    expect(link).toHaveAttribute("aria-current", "page");
  });
});
