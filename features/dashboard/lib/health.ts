import "server-only";

export type HealthStatus = "connected" | "degraded" | "unreachable";

export type EndpointHealth = {
  status: HealthStatus;
  endpointUrl: string;
};

type EndpointHealthPayload = {
  services: Record<string, string>;
};

/** Relative path for the local AWS endpoint health probe. */
export const ENDPOINT_HEALTH_PATH = "/_localstack/health";

export async function getEndpointHealth(): Promise<EndpointHealth> {
  const endpointUrl = process.env.AWS_ENDPOINT_URL ?? "";

  try {
    const res = await fetch(`${endpointUrl}${ENDPOINT_HEALTH_PATH}`, {
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });

    if (!res.ok) {
      return { status: "unreachable", endpointUrl };
    }

    const data: EndpointHealthPayload = await res.json();
    const serviceStatuses = Object.values(data.services ?? {});

    const allRunning = serviceStatuses.every(
      (s) => s === "running" || s === "available",
    );
    const status: HealthStatus = allRunning ? "connected" : "degraded";

    return { status, endpointUrl };
  } catch {
    return { status: "unreachable", endpointUrl };
  }
}
