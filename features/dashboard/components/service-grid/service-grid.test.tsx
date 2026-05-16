import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServiceGrid } from "./service-grid";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const comingSoonLabel = "Coming soon";

afterEach(() => {
  cleanup();
});

describe("ServiceGrid", () => {
  it("renders a link for each enabled service", async () => {
    const { services } = await import("@/lib/services-registry");
    const enabled = services.filter((s) => s.status === "enabled");

    render(
      <ServiceGrid localePrefix="/en" comingSoonLabel={comingSoonLabel} />,
    );

    for (const service of enabled) {
      const link = screen.getByRole("link", { name: new RegExp(service.label, "i") });
      expect(link).toHaveAttribute("href", `/en${service.href}`);
    }

    expect(screen.getAllByRole("link")).toHaveLength(enabled.length);
  });

  it("uses responsive grid layout classes", () => {
    const { container } = render(
      <ServiceGrid localePrefix="/en" comingSoonLabel={comingSoonLabel} />,
    );

    const list = container.querySelector('[role="list"]');
    expect(list?.className).toMatch(/grid-cols-1/);
    expect(list?.className).toMatch(/sm:grid-cols-2/);
    expect(list?.className).toMatch(/lg:grid-cols-3/);
  });
});
