"use client";

import Link from "next/link";
import { services } from "@/lib/services-registry";

type Props = {
  localePrefix: string;
  servicesLabel?: string;
  onNavigate?: () => void;
};

export function NavLinks({ localePrefix, servicesLabel, onNavigate }: Props) {
  const enabled = services.filter((s) => s.status === "enabled");

  return (
    <>
      {servicesLabel && (
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {servicesLabel}
        </p>
      )}
      <nav className="flex flex-col gap-1">
        {enabled.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.slug}
              href={`${localePrefix}${service.href}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={onNavigate}
            >
              <Icon className="size-4 shrink-0" />
              {service.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
