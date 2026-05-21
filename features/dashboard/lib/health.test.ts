import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENDPOINT_HEALTH_PATH, getEndpointHealth } from "./health";

vi.mock("server-only", () => ({}));

const ENDPOINT = "http://localhost:4566";

function mockFetch(opts: { ok?: boolean; body?: unknown }): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: opts.ok ?? true,
      json: () => Promise.resolve(opts.body),
    } as Response),
  );
}

describe("getEndpointHealth", () => {
  beforeEach(() => {
    vi.stubEnv("AWS_ENDPOINT_URL", ENDPOINT);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns connected when all services are running", async () => {
    mockFetch({
      ok: true,
      body: { services: { s3: "running", sqs: "running", sns: "available" } },
    });

    const result = await getEndpointHealth();

    expect(result.status).toBe("connected");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });

  it("returns degraded when some services are not running", async () => {
    mockFetch({
      ok: true,
      body: { services: { s3: "running", sqs: "error", sns: "running" } },
    });

    const result = await getEndpointHealth();

    expect(result.status).toBe("degraded");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });

  it("returns connected when services object is empty", async () => {
    mockFetch({ ok: true, body: { services: {} } });

    const result = await getEndpointHealth();

    expect(result.status).toBe("connected");
  });

  it("returns unreachable when response is not ok", async () => {
    mockFetch({ ok: false, body: null });

    const result = await getEndpointHealth();

    expect(result.status).toBe("unreachable");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });

  it("returns unreachable when fetch throws (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const result = await getEndpointHealth();

    expect(result.status).toBe("unreachable");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });

  it("returns unreachable when fetch times out (AbortError)", async () => {
    const abortError = Object.assign(new Error("The operation was aborted"), {
      name: "AbortError",
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    const result = await getEndpointHealth();

    expect(result.status).toBe("unreachable");
  });

  it("uses AWS_ENDPOINT_URL env var in endpointUrl", async () => {
    const customEndpoint = "http://192.168.1.100:4566";
    vi.stubEnv("AWS_ENDPOINT_URL", customEndpoint);
    mockFetch({ ok: true, body: { services: { s3: "running" } } });

    const result = await getEndpointHealth();

    expect(result.endpointUrl).toBe(customEndpoint);
  });

  it("fetches the configured health probe path", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ services: {} }),
    } as Response);
    vi.stubGlobal("fetch", fetchSpy);

    await getEndpointHealth();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${ENDPOINT}${ENDPOINT_HEALTH_PATH}`,
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  // --- PR-2: per-service ServiceStatus ---

  it("returns services map with all 5 core keys always present", async () => {
    mockFetch({
      ok: true,
      body: { services: { s3: "running" } },
    });

    const result = await getEndpointHealth();

    expect(result.services).toHaveProperty("S3");
    expect(result.services).toHaveProperty("SQS");
    expect(result.services).toHaveProperty("DynamoDB");
    expect(result.services).toHaveProperty("Lambda");
    expect(result.services).toHaveProperty("SNS");
  });

  it('maps "running" to "healthy"', async () => {
    mockFetch({
      ok: true,
      body: { services: { s3: "running", sqs: "running", dynamodb: "running", lambda: "running", sns: "running" } },
    });

    const result = await getEndpointHealth();

    expect(result.services["S3"]).toBe("healthy");
    expect(result.services["SQS"]).toBe("healthy");
    expect(result.services["DynamoDB"]).toBe("healthy");
    expect(result.services["Lambda"]).toBe("healthy");
    expect(result.services["SNS"]).toBe("healthy");
  });

  it('maps any other non-empty string to "degraded"', async () => {
    mockFetch({
      ok: true,
      body: { services: { s3: "stopped", sqs: "error", dynamodb: "available" } },
    });

    const result = await getEndpointHealth();

    expect(result.services["S3"]).toBe("degraded");
    expect(result.services["SQS"]).toBe("degraded");
    // "available" is not "running" so also degraded
    expect(result.services["DynamoDB"]).toBe("degraded");
  });

  it('maps absent service to "unreachable"', async () => {
    mockFetch({
      ok: true,
      body: { services: { s3: "running" } },
    });

    const result = await getEndpointHealth();

    // None of these are in the response → unreachable
    expect(result.services["SQS"]).toBe("unreachable");
    expect(result.services["DynamoDB"]).toBe("unreachable");
    expect(result.services["Lambda"]).toBe("unreachable");
    expect(result.services["SNS"]).toBe("unreachable");
  });

  it("maps all services to unreachable on fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const result = await getEndpointHealth();

    expect(result.services["S3"]).toBe("unreachable");
    expect(result.services["SQS"]).toBe("unreachable");
    expect(result.services["DynamoDB"]).toBe("unreachable");
    expect(result.services["Lambda"]).toBe("unreachable");
    expect(result.services["SNS"]).toBe("unreachable");
  });

  it("existing aggregate status field is unchanged (backward compat)", async () => {
    mockFetch({
      ok: true,
      body: { services: { s3: "running", sqs: "running", lambda: "running", dynamodb: "running", sns: "running" } },
    });

    const result = await getEndpointHealth();

    expect(result.status).toBe("connected");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });
});
