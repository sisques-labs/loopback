import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { PresetPicker } from "./preset-picker";
import type { PresetSlug } from "@/features/seed/presets/schema";

const dict = {
  sectionTitle: "Choose a preset",
  ecommerce: { name: "E-commerce", description: "S3 buckets, SQS queues, DynamoDB tables." },
  blog: { name: "Blog", description: "Assets bucket, comments queue." },
  eventDriven: { name: "Event-Driven", description: "Ingestion and DLQ queues." },
};

afterEach(() => {
  cleanup();
  mockPush.mockClear();
});

describe("PresetPicker — renders all 3 preset cards", () => {
  it("shows all three preset names", () => {
    render(<PresetPicker dict={dict} selectedPreset={undefined} localePrefix="/en" />);
    expect(screen.getByText("E-commerce")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Event-Driven")).toBeInTheDocument();
  });

  it("shows the section title", () => {
    render(<PresetPicker dict={dict} selectedPreset={undefined} localePrefix="/en" />);
    expect(screen.getByText("Choose a preset")).toBeInTheDocument();
  });
});

describe("PresetPicker — selection via URL", () => {
  it("highlights the selected preset card when selectedPreset is provided", () => {
    render(
      <PresetPicker
        dict={dict}
        selectedPreset={"blog" as PresetSlug}
        localePrefix="/en"
      />,
    );
    // Selected card should have aria-pressed=true
    const blogCard = screen.getByRole("button", { name: /Blog/i });
    expect(blogCard).toHaveAttribute("aria-pressed", "true");
  });

  it("no card is highlighted when selectedPreset is undefined", () => {
    render(<PresetPicker dict={dict} selectedPreset={undefined} localePrefix="/en" />);
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).not.toHaveAttribute("aria-pressed", "true");
    }
  });
});

describe("PresetPicker — navigation", () => {
  it("navigates to ?preset=ecommerce when ecommerce card is clicked", async () => {
    render(<PresetPicker dict={dict} selectedPreset={undefined} localePrefix="/en" />);
    const ecommerceCard = screen.getByRole("button", { name: /E-commerce/i });
    await userEvent.click(ecommerceCard);
    expect(mockPush).toHaveBeenCalledWith("/en/seed?preset=ecommerce");
  });

  it("navigates to ?preset=blog when blog card is clicked", async () => {
    render(<PresetPicker dict={dict} selectedPreset={undefined} localePrefix="/en" />);
    const blogCard = screen.getByRole("button", { name: /Blog/i });
    await userEvent.click(blogCard);
    expect(mockPush).toHaveBeenCalledWith("/en/seed?preset=blog");
  });
});

describe("PresetPicker — touch targets", () => {
  it("each card has at least a 44px touch target (min-h-11)", () => {
    render(<PresetPicker dict={dict} selectedPreset={undefined} localePrefix="/en" />);
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn.className).toContain("min-h-11");
    }
  });
});
