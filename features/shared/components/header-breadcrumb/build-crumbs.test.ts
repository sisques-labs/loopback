import { describe, expect, it } from "vitest";
import { buildCrumbs } from "./build-crumbs";

describe("buildCrumbs", () => {
  // SC-01: S3 list page
  it("returns single S3 crumb on /en/s3", () => {
    const crumbs = buildCrumbs("/en/s3", "en", "Settings");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("S3");
    expect(crumbs[0].href).toBeUndefined();
  });

  // SC-02: S3 detail page
  it("returns S3 link + bucket crumb on /en/s3/my-bucket", () => {
    const crumbs = buildCrumbs("/en/s3/my-bucket", "en", "Settings");
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("S3");
    expect(crumbs[0].href).toBe("/en/s3");
    expect(crumbs[1].label).toBe("my-bucket");
    expect(crumbs[1].href).toBeUndefined();
  });

  // S3 detail with URL-encoded segment
  it("decodes URL-encoded S3 bucket segment", () => {
    const crumbs = buildCrumbs("/en/s3/my%20bucket", "en", "Settings");
    expect(crumbs[1].label).toBe("my bucket");
  });

  // SQS list page
  it("returns single SQS crumb on /en/sqs", () => {
    const crumbs = buildCrumbs("/en/sqs", "en", "Settings");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("SQS");
    expect(crumbs[0].href).toBeUndefined();
  });

  // SC-04: SQS detail page — encoded queue URL
  it("decodes encoded queue URL to queue name on /en/sqs/[queueKey]", () => {
    const encodedUrl = encodeURIComponent(
      "http://localhost:4566/000000000000/my-queue",
    );
    const crumbs = buildCrumbs(`/en/sqs/${encodedUrl}`, "en", "Settings");
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("SQS");
    expect(crumbs[0].href).toBe("/en/sqs");
    expect(crumbs[1].label).toBe("my-queue");
    expect(crumbs[1].href).toBeUndefined();
  });

  // SNS list page
  it("returns single SNS crumb on /en/sns", () => {
    const crumbs = buildCrumbs("/en/sns", "en", "Settings");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("SNS");
    expect(crumbs[0].href).toBeUndefined();
  });

  // SC-03: SNS detail page — encoded ARN
  it("extracts topic name from encoded SNS ARN", () => {
    const encodedArn = encodeURIComponent(
      "arn:aws:sns:us-east-1:000000000000:my-topic",
    );
    const crumbs = buildCrumbs(`/en/sns/${encodedArn}`, "en", "Settings");
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("SNS");
    expect(crumbs[0].href).toBe("/en/sns");
    expect(crumbs[1].label).toBe("my-topic");
    expect(crumbs[1].href).toBeUndefined();
  });

  // SC-14: SNS ARN edge case — empty pop (malformed ARN ending with colon)
  it("falls back to full decoded ARN when SNS pop() returns empty string", () => {
    const malformedArn = encodeURIComponent(
      "arn:aws:sns:us-east-1:000000000000:",
    );
    const crumbs = buildCrumbs(`/en/sns/${malformedArn}`, "en", "Settings");
    expect(crumbs[1].label).toBe("arn:aws:sns:us-east-1:000000000000:");
    expect(crumbs[1].label.length).toBeGreaterThan(0);
  });

  // DynamoDB list page
  it("returns single DynamoDB crumb on /en/dynamodb", () => {
    const crumbs = buildCrumbs("/en/dynamodb", "en", "Settings");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("DynamoDB");
    expect(crumbs[0].href).toBeUndefined();
  });

  // SC-05: DynamoDB detail crumb
  it("returns DynamoDB link + table crumb", () => {
    const crumbs = buildCrumbs("/en/dynamodb/orders-table", "en", "Settings");
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("DynamoDB");
    expect(crumbs[0].href).toBe("/en/dynamodb");
    expect(crumbs[1].label).toBe("orders-table");
  });

  // Lambda list page
  it("returns single Lambda crumb on /en/lambda", () => {
    const crumbs = buildCrumbs("/en/lambda", "en", "Settings");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Lambda");
    expect(crumbs[0].href).toBeUndefined();
  });

  // SC-06: Lambda detail crumb
  it("returns Lambda link + function crumb", () => {
    const crumbs = buildCrumbs("/en/lambda/my-function", "en", "Settings");
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("Lambda");
    expect(crumbs[0].href).toBe("/en/lambda");
    expect(crumbs[1].label).toBe("my-function");
  });

  it("returns single Dashboard crumb on /en/dashboard", () => {
    const crumbs = buildCrumbs("/en/dashboard", "en", "Settings", undefined, "Dashboard");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Dashboard");
    expect(crumbs[0].href).toBeUndefined();
  });

  it("returns localized Dashboard crumb on /es/dashboard", () => {
    const crumbs = buildCrumbs("/es/dashboard", "es", "Configuración", undefined, "Panel");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Panel");
  });

  it("falls back to Dashboard when dashboardLabel is omitted", () => {
    const crumbs = buildCrumbs("/en/dashboard", "en", "Settings");
    expect(crumbs[0].label).toBe("Dashboard");
  });

  // SC-07: Settings page crumb
  it("returns single Settings crumb using provided settingsLabel", () => {
    const crumbs = buildCrumbs("/en/settings", "en", "Configuración");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Configuración");
    expect(crumbs[0].href).toBeUndefined();
  });

  // SC-08: Locale prefix stripped
  it("strips es locale and returns correct hrefs for es locale", () => {
    const crumbs = buildCrumbs("/es/s3/mi-bucket", "es", "Configuración");
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("S3");
    expect(crumbs[0].href).toBe("/es/s3");
    expect(crumbs[1].label).toBe("mi-bucket");
    // locale must not appear as a crumb label
    expect(crumbs.map((c) => c.label)).not.toContain("es");
  });

  // SC-12: Root route — empty breadcrumb
  it("returns empty array for root /en path", () => {
    const crumbs = buildCrumbs("/en", "en", "Settings");
    expect(crumbs).toHaveLength(0);
  });

  // SC-13: Unknown route segment
  it("returns empty array for unknown service segment", () => {
    const crumbs = buildCrumbs("/en/unknown-service", "en", "Settings");
    expect(crumbs).toHaveLength(0);
  });

  // SQS: FIFO queue URL
  it("handles FIFO queue URLs", () => {
    const encodedUrl = encodeURIComponent(
      "http://localhost:4566/000000000000/processing.fifo",
    );
    const crumbs = buildCrumbs(`/en/sqs/${encodedUrl}`, "en", "Settings");
    expect(crumbs[1].label).toBe("processing.fifo");
  });

  // Locale is not leaked as a crumb in any service
  it("does not include locale code in any crumb label", () => {
    const crumbs = buildCrumbs("/en/s3", "en", "Settings");
    expect(crumbs.map((c) => c.label)).not.toContain("en");
  });

  // Terminal breadcrumb
  it("returns single Terminal crumb for /en/terminal", () => {
    const crumbs = buildCrumbs("/en/terminal", "en", "Settings", "Terminal");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Terminal");
    expect(crumbs[0].href).toBeUndefined();
  });

  it("does not return empty array for /en/terminal", () => {
    const crumbs = buildCrumbs("/en/terminal", "en", "Settings", "Terminal");
    expect(crumbs.length).toBeGreaterThan(0);
  });

  it("returns fallback 'Terminal' crumb when terminalLabel is undefined", () => {
    const crumbs = buildCrumbs("/en/terminal", "en", "Settings", undefined);
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Terminal");
    expect(crumbs[0].href).toBeUndefined();
  });
});
