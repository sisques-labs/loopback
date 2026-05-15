import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateQueueDialog } from "./create-queue-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/sqs/use-cases/create-queue/create-queue", () => ({
  createQueueAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "New queue",
  title: "Create queue",
  nameLabel: "Queue name",
  namePlaceholder: "my-queue",
  nameFifoPlaceholder: "my-queue (becomes my-queue.fifo)",
  cancel: "Cancel",
  creating: "Creating…",
  submit: "Create",
  success: "Queue created successfully.",
  fifoLabel: "FIFO queue",
  fifoHint: "Name will be suffixed with .fifo automatically when needed.",
};

describe("CreateQueueDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses a 44px mobile touch target on the trigger button", () => {
    render(
      <CreateQueueDialog dict={dict} locale="en" closeLabel="Close" />,
    );

    const trigger = screen.getByRole("button", { name: /New queue/i });
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
    expect(trigger.className).toContain("md:min-h-9");
    expect(trigger.className).toContain("md:min-w-9");
  });
});
