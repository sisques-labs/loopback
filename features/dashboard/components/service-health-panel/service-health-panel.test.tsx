import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ServiceStatus } from "@/features/dashboard/lib/health";
import { ServiceHealthPanel } from "./service-health-panel";

const dict = {
  title: "LocalStack Service Status",
  services: {
    S3: "S3",
    SQS: "SQS",
    DynamoDB: "DynamoDB",
    Lambda: "Lambda",
    SNS: "SNS",
  },
  status: {
    healthy: "Healthy",
    degraded: "Degraded",
    unreachable: "Unreachable",
  },
  hint: "Check LocalStack is running",
  columns: {
    service: "Service",
    status: "Status",
  },
};

function allUnreachable(): Record<string, ServiceStatus> {
  return { S3: "unreachable", SQS: "unreachable", DynamoDB: "unreachable", Lambda: "unreachable", SNS: "unreachable" };
}

function allHealthy(): Record<string, ServiceStatus> {
  return { S3: "healthy", SQS: "healthy", DynamoDB: "healthy", Lambda: "healthy", SNS: "healthy" };
}

afterEach(() => {
  cleanup();
});

describe("ServiceHealthPanel", () => {
  it("renders all 5 services", () => {
    render(<ServiceHealthPanel services={allUnreachable()} dict={dict} />);
    expect(screen.getByText("S3")).toBeInTheDocument();
    expect(screen.getByText("SQS")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
    expect(screen.getByText("Lambda")).toBeInTheDocument();
    expect(screen.getByText("SNS")).toBeInTheDocument();
  });

  it("renders the panel title", () => {
    render(<ServiceHealthPanel services={allHealthy()} dict={dict} />);
    expect(screen.getByText(dict.title)).toBeInTheDocument();
  });

  it("healthy service shows green indicator", () => {
    const services: Record<string, ServiceStatus> = { ...allUnreachable(), S3: "healthy" };
    render(<ServiceHealthPanel services={services} dict={dict} />);
    const indicator = screen.getAllByTestId("service-status-indicator").find(
      (el) => el.closest("[data-service='S3']") !== null,
    );
    expect(indicator?.className).toMatch(/green/);
  });

  it("degraded service shows amber indicator", () => {
    const services: Record<string, ServiceStatus> = { ...allUnreachable(), SQS: "degraded" };
    render(<ServiceHealthPanel services={services} dict={dict} />);
    const indicator = screen.getAllByTestId("service-status-indicator").find(
      (el) => el.closest("[data-service='SQS']") !== null,
    );
    expect(indicator?.className).toMatch(/amber|yellow/);
  });

  it("unreachable service shows red indicator", () => {
    render(<ServiceHealthPanel services={allUnreachable()} dict={dict} />);
    const indicators = screen.getAllByTestId("service-status-indicator");
    // All are unreachable — every indicator should be red
    for (const indicator of indicators) {
      expect(indicator.className).toMatch(/red/);
    }
  });

  it("unreachable service shows hint text", () => {
    render(<ServiceHealthPanel services={allUnreachable()} dict={dict} />);
    const hints = screen.getAllByText(dict.hint);
    expect(hints.length).toBeGreaterThanOrEqual(1);
  });

  it("degraded service shows hint text", () => {
    const services: Record<string, ServiceStatus> = { ...allHealthy(), Lambda: "degraded" };
    render(<ServiceHealthPanel services={services} dict={dict} />);
    expect(screen.getByText(dict.hint)).toBeInTheDocument();
  });

  it("healthy service does NOT show hint text", () => {
    render(<ServiceHealthPanel services={allHealthy()} dict={dict} />);
    expect(screen.queryByText(dict.hint)).not.toBeInTheDocument();
  });

  it("renders all 5 services even when services map is empty", () => {
    render(<ServiceHealthPanel services={{}} dict={dict} />);
    expect(screen.getByText("S3")).toBeInTheDocument();
    expect(screen.getByText("SQS")).toBeInTheDocument();
    expect(screen.getByText("DynamoDB")).toBeInTheDocument();
    expect(screen.getByText("Lambda")).toBeInTheDocument();
    expect(screen.getByText("SNS")).toBeInTheDocument();
  });
});
