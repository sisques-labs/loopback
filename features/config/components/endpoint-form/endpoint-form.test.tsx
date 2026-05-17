import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/config/use-cases/update-endpoint/update-endpoint", () => ({
  updateEndpointAction: vi.fn(),
}));

const mockUseActionState = vi.fn();

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    useActionState: (...args: unknown[]) => mockUseActionState(...args),
  };
});

import { EndpointForm } from "./endpoint-form";

const dict = {
  endpointInputLabel: "Custom endpoint URL",
  endpointInputPlaceholder: "http://localhost:4566",
  endpointSave: "Save",
  endpointClear: "Clear override",
  endpointSaving: "Saving…",
  endpointSuccess: "Endpoint saved",
  endpointInvalidUrl: "Must be a valid absolute URL",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EndpointForm", () => {
  it("renders input pre-populated with currentEndpoint prop", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<EndpointForm currentEndpoint="http://localhost:4566" dict={dict} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("http://localhost:4566");
  });

  it("renders the clear button", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<EndpointForm currentEndpoint="" dict={dict} />);

    expect(screen.getByRole("button", { name: /clear override/i })).toBeInTheDocument();
  });

  it("renders save button", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<EndpointForm currentEndpoint="" dict={dict} />);

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("shows success banner when state is success", () => {
    mockUseActionState.mockReturnValue([{ status: "success", data: undefined }, vi.fn(), false]);

    render(<EndpointForm currentEndpoint="" dict={dict} />);

    expect(screen.getByText(dict.endpointSuccess)).toBeInTheDocument();
  });

  it("shows error message when state is error", () => {
    mockUseActionState.mockReturnValue([
      { status: "error", message: dict.endpointInvalidUrl },
      vi.fn(),
      false,
    ]);

    render(<EndpointForm currentEndpoint="" dict={dict} />);

    expect(screen.getByText(dict.endpointInvalidUrl)).toBeInTheDocument();
  });

  it("does not show success banner when state is idle", () => {
    mockUseActionState.mockReturnValue([{ status: "idle" }, vi.fn(), false]);

    render(<EndpointForm currentEndpoint="" dict={dict} />);

    expect(screen.queryByText(dict.endpointSuccess)).not.toBeInTheDocument();
  });
});
