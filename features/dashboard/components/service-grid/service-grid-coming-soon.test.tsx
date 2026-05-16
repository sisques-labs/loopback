import { cleanup, render, screen } from "@testing-library/react";
import { Server } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

vi.mock("@/lib/services-registry", () => ({
  services: [
    {
      slug: "s3",
      label: "S3",
      icon: Server,
      href: "/s3",
      status: "enabled",
    },
    {
      slug: "preview",
      label: "Preview",
      icon: Server,
      href: "/preview",
      status: "coming-soon",
    },
  ],
}));

import { ServiceGrid } from "./service-grid";

afterEach(() => {
  cleanup();
});

describe("ServiceGrid coming-soon", () => {
  it("renders coming-soon cards without links", () => {
    render(<ServiceGrid localePrefix="/en" comingSoonLabel="Coming soon" />);

    expect(screen.getByRole("link", { name: /s3/i })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /preview/i })).toBeNull();
    expect(screen.getByText("Coming soon")).toBeTruthy();
    expect(screen.getByText("Preview")).toBeTruthy();

    const disabled = screen.getByText("Preview").closest("[aria-disabled='true']");
    expect(disabled).toBeTruthy();
  });
});
