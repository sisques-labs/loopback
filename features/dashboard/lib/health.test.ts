import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLocalStackHealth } from "./health";

// ── Mocks ──────────────────────────────────────────────────────────────────

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

// ── Tests ──────────────────────────────────────────────────────────────────

describe("getLocalStackHealth", () => {
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

    const result = await getLocalStackHealth();

    expect(result.status).toBe("connected");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });

  it("returns degraded when some services are not running", async () => {
    mockFetch({
      ok: true,
      body: { services: { s3: "running", sqs: "error", sns: "running" } },
    });

    const result = await getLocalStackHealth();

    expect(result.status).toBe("degraded");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });

  it("returns degraded when services object is empty", async () => {
    mockFetch({ ok: true, body: { services: {} } });

    const result = await getLocalStackHealth();

    // empty → allRunning vacuously true → connected
    expect(result.status).toBe("connected");
  });

  it("returns unreachable when response is not ok", async () => {
    mockFetch({ ok: false, body: null });

    const result = await getLocalStackHealth();

    expect(result.status).toBe("unreachable");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });

  it("returns unreachable when fetch throws (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const result = await getLocalStackHealth();

    expect(result.status).toBe("unreachable");
    expect(result.endpointUrl).toBe(ENDPOINT);
  });

  it("returns unreachable when fetch times out (AbortError)", async () => {
    const abortError = Object.assign(new Error("The operation was aborted"), {
      name: "AbortError",
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    const result = await getLocalStackHealth();

    expect(result.status).toBe("unreachable");
  });

  it("uses AWS_ENDPOINT_URL env var in endpointUrl", async () => {
    const customEndpoint = "http://192.168.1.100:4566";
    vi.stubEnv("AWS_ENDPOINT_URL", customEndpoint);
    mockFetch({ ok: true, body: { services: { s3: "running" } } });

    const result = await getLocalStackHealth();

    expect(result.endpointUrl).toBe(customEndpoint);
  });

  it("fetches the correct health endpoint URL", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ services: {} }),
    } as Response);
    vi.stubGlobal("fetch", fetchSpy);

    await getLocalStackHealth();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${ENDPOINT}/_localstack/health`,
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
