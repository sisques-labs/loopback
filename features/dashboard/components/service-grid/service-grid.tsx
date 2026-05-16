import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import { services } from "@/lib/services-registry";
import { cn } from "@/lib/utils";

type Props = {
  localePrefix: string;
  comingSoonLabel: AppDict["dashboard"]["services"]["comingSoon"];
};

export function ServiceGrid({ localePrefix, comingSoonLabel }: Props) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
    >
      {services.map((service) => {
        const Icon = service.icon;
        const href = `${localePrefix}${service.href}`;
        const isEnabled = service.status === "enabled";

        const card = (
          <Card
            className={cn(
              "min-h-24 py-4 transition-colors",
              isEnabled && "hover:bg-muted/40",
              !isEnabled && "opacity-60",
            )}
          >
            <CardHeader className="flex flex-row items-center gap-3 px-4">
              <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <CardTitle className="text-base">{service.label}</CardTitle>
                {!isEnabled && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comingSoonLabel}
                  </p>
                )}
              </div>
            </CardHeader>
          </Card>
        );

        if (isEnabled) {
          return (
            <li key={service.slug}>
              <Link
                href={href}
                className="block min-h-11 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {card}
              </Link>
            </li>
          );
        }

        return (
          <li key={service.slug}>
            <div
              aria-disabled="true"
              className="block min-h-11 cursor-not-allowed rounded-lg"
            >
              {card}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
