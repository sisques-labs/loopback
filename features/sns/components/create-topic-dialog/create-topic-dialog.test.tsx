import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateTopicDialog } from "./create-topic-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/sns/use-cases/create-topic/create-topic", () => ({
  createTopicAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "New topic",
  title: "Create topic",
  nameLabel: "Topic name",
  namePlaceholder: "my-topic",
  nameFifoPlaceholder: "my-topic (auto-suffixed to my-topic.fifo)",
  cancel: "Cancel",
  creating: "Creating…",
  submit: "Create",
  success: "Topic created successfully.",
  fifoLabel: "FIFO queue",
  fifoHint: "Name will be suffixed with .fifo automatically",
};

describe("CreateTopicDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses a 44px mobile touch target on the trigger button", () => {
    render(
      <CreateTopicDialog dict={dict} locale="en" closeLabel="Close" />,
    );

    const trigger = screen.getByRole("button", { name: /New topic/i });
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
  });
});
