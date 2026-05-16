import "server-only";

export type HealthStatus = "connected" | "degraded" | "unreachable";

export type LocalStackHealth = {
  status: HealthStatus;
  endpointUrl: string;
};

type LocalStackHealthResponse = {
  services: Record<string, string>;
};

export async function getLocalStackHealth(): Promise<LocalStackHealth> {
  const endpointUrl = process.env.AWS_ENDPOINT_URL ?? "";

  try {
    const res = await fetch(`${endpointUrl}/_localstack/health`, {
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });

    if (!res.ok) {
      return { status: "unreachable", endpointUrl };
    }

    const data: LocalStackHealthResponse = await res.json();
    const serviceStatuses = Object.values(data.services ?? {});

    const allRunning = serviceStatuses.every((s) => s === "running" || s === "available");
    const status: HealthStatus = allRunning ? "connected" : "degraded";

    return { status, endpointUrl };
  } catch {
    return { status: "unreachable", endpointUrl };
  }
}
