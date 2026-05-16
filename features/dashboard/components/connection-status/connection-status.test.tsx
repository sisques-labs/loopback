import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ConnectionStatus } from "./connection-status";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

const connectionDict: AppDict["dashboard"]["connection"] = {
  title: "Connection",
  connected: "Connected",
  unreachable: "Unreachable",
  degraded: "Degraded",
};

afterEach(() => {
  cleanup();
});

describe("ConnectionStatus", () => {
  it.each([
    ["connected", "Connected", "default"],
    ["degraded", "Degraded", "secondary"],
    ["unreachable", "Unreachable", "destructive"],
  ] as const)(
    "shows %s label with %s badge variant",
    (status, label, variant) => {
      render(
        <ConnectionStatus
          health={{ status, endpointUrl: "http://localhost:4566" }}
          dict={connectionDict}
        />,
      );

      expect(screen.getByRole("region", { name: /^connection$/i })).toBeTruthy();
      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.getByText("http://localhost:4566")).toBeTruthy();

      const badge = screen.getByText(label).closest("[data-slot='badge']");
      expect(badge?.getAttribute("data-variant") ?? badge?.className).toBeDefined();
      if (variant === "destructive") {
        expect(badge?.className).toMatch(/destructive/);
      }
    },
  );

  it("shows em dash when endpoint URL is empty", () => {
    render(
      <ConnectionStatus
        health={{ status: "unreachable", endpointUrl: "" }}
        dict={connectionDict}
      />,
    );

    expect(screen.getByText("—")).toBeTruthy();
  });
});
