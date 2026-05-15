import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateBucketDialog } from "./create-bucket-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/features/s3/use-cases/create-bucket/create-bucket", () => ({
  createBucketAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: () => [{ status: "idle" }, vi.fn(), false] as const,
  };
});

const dict = {
  trigger: "New bucket",
  title: "Create bucket",
  nameLabel: "Bucket name",
  namePlaceholder: "my-bucket",
  cancel: "Cancel",
  creating: "Creating…",
  submit: "Create",
  success: "Bucket created successfully.",
};

describe("CreateBucketDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses a 44px mobile touch target on the trigger button", () => {
    render(<CreateBucketDialog dict={dict} closeLabel="Close" />);

    const trigger = screen.getByRole("button", { name: /New bucket/i });
    expect(trigger.className).toContain("min-h-11");
    expect(trigger.className).toContain("min-w-11");
    expect(trigger.className).toContain("md:min-h-9");
    expect(trigger.className).toContain("md:min-w-9");
  });
});
