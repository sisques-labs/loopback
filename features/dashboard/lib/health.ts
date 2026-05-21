import "server-only";

export type HealthStatus = "connected" | "degraded" | "unreachable";

export type ServiceStatus = "healthy" | "degraded" | "unreachable";

export type EndpointHealth = {
  status: HealthStatus;
  endpointUrl: string;
  services: Record<string, ServiceStatus>;
};

type EndpointHealthPayload = {
  services: Record<string, string>;
};

/** Relative path for the local AWS endpoint health probe. */
export const ENDPOINT_HEALTH_PATH = "/_localstack/health";

/** The fixed set of LocalStack services always shown in the health panel. */
const CORE_SERVICES = ["S3", "SQS", "DynamoDB", "Lambda", "SNS"] as const;

/** Maps a raw LocalStack service string to a ServiceStatus. */
function toServiceStatus(raw: string | undefined): ServiceStatus {
  if (!raw) return "unreachable";
  if (raw === "running") return "healthy";
  return "degraded";
}

/**
 * Builds a services map for the fixed set of core services.
 * Keys in `raw` are case-insensitive matched against each core service name.
 */
function buildServicesMap(
  raw: Record<string, string>,
): Record<string, ServiceStatus> {
  const lowered: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    lowered[k.toLowerCase()] = v;
  }

  const result: Record<string, ServiceStatus> = {};
  for (const name of CORE_SERVICES) {
    result[name] = toServiceStatus(lowered[name.toLowerCase()]);
  }
  return result;
}

/** Returns all 5 core services as unreachable (used on error paths). */
function unreachableServicesMap(): Record<string, ServiceStatus> {
  const result: Record<string, ServiceStatus> = {};
  for (const name of CORE_SERVICES) {
    result[name] = "unreachable";
  }
  return result;
}

export async function getEndpointHealth(): Promise<EndpointHealth> {
  const endpointUrl = process.env.AWS_ENDPOINT_URL ?? "";

  try {
    const res = await fetch(`${endpointUrl}${ENDPOINT_HEALTH_PATH}`, {
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });

    if (!res.ok) {
      return { status: "unreachable", endpointUrl, services: unreachableServicesMap() };
    }

    const data: EndpointHealthPayload = await res.json();
    const rawServices = data.services ?? {};
    const serviceStatuses = Object.values(rawServices);

    const allRunning = serviceStatuses.every(
      (s) => s === "running" || s === "available",
    );
    const status: HealthStatus = allRunning ? "connected" : "degraded";

    return { status, endpointUrl, services: buildServicesMap(rawServices) };
  } catch {
    return { status: "unreachable", endpointUrl, services: unreachableServicesMap() };
  }
}
