import { Badge } from "@/components/ui/badge";
import type { HealthStatus } from "@/features/dashboard/lib/health";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  health: { status: HealthStatus; endpointUrl: string };
  dict: AppDict["dashboard"]["connection"];
};

const statusVariant: Record<
  HealthStatus,
  "default" | "secondary" | "destructive"
> = {
  connected: "default",
  degraded: "secondary",
  unreachable: "destructive",
};

export function ConnectionStatus({ health, dict }: Props) {
  const statusLabel = {
    connected: dict.connected,
    degraded: dict.degraded,
    unreachable: dict.unreachable,
  }[health.status];

  return (
    <section
      aria-labelledby="dashboard-connection-title"
      className="rounded-lg border bg-card p-4 md:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2
            id="dashboard-connection-title"
            className="text-sm font-medium text-foreground"
          >
            {dict.title}
          </h2>
          <p className="mt-1 font-mono text-xs break-all text-muted-foreground">
            {health.endpointUrl || "—"}
          </p>
        </div>
        <Badge variant={statusVariant[health.status]}>{statusLabel}</Badge>
      </div>
    </section>
  );
}
