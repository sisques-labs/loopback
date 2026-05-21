import type { ServiceStatus } from "@/features/dashboard/lib/health";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type ServiceHealthPanelDict = AppDict["dashboard"]["serviceHealthPanel"];

type Props = {
  services: Record<string, ServiceStatus>;
  dict: ServiceHealthPanelDict;
};

const CORE_SERVICES = ["S3", "SQS", "DynamoDB", "Lambda", "SNS"] as const;

const indicatorClass: Record<ServiceStatus, string> = {
  healthy: "bg-green-500",
  degraded: "bg-amber-500",
  unreachable: "bg-red-500",
};

export function ServiceHealthPanel({ services, dict }: Props) {
  return (
    <section
      aria-labelledby="service-health-panel-title"
      className="rounded-lg border bg-card p-4 md:p-6"
    >
      <h2
        id="service-health-panel-title"
        className="mb-4 text-sm font-medium text-foreground"
      >
        {dict.title}
      </h2>

      <ul className="flex flex-col gap-2" role="list">
        {CORE_SERVICES.map((name) => {
          const status: ServiceStatus = services[name] ?? "unreachable";
          const showHint = status === "degraded" || status === "unreachable";

          return (
            <li
              key={name}
              data-service={name}
              className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="flex items-center gap-2 min-w-[8rem]">
                <span
                  data-testid="service-status-indicator"
                  className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${indicatorClass[status]}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{dict.services[name as keyof typeof dict.services]}</span>
              </span>

              {showHint && (
                <span className="ml-4 text-xs text-muted-foreground sm:ml-0">
                  {dict.hint}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
