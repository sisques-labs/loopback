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
});
