"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { services } from "@/lib/services-registry";
import { cn } from "@/lib/utils";

type Props = {
  localePrefix: string;
  servicesLabel?: string;
  settingsSectionLabel?: string;
  settingsLinkLabel?: string;
  onNavigate?: () => void;
};

const navLinkClass = cn(
  "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors",
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  "md:min-h-9 md:py-2",
);

export function NavLinks({
  localePrefix,
  servicesLabel,
  settingsSectionLabel,
  settingsLinkLabel,
  onNavigate,
}: Props) {
  const enabled = services.filter((s) => s.status === "enabled");

  return (
    <>
      {servicesLabel && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:mb-6">
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
              className={navLinkClass}
              onClick={onNavigate}
            >
              <Icon className="size-4 shrink-0" />
              {service.label}
            </Link>
          );
        })}
      </nav>
      {settingsSectionLabel && settingsLinkLabel && (
        <>
          <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:mb-6">
            {settingsSectionLabel}
          </p>
          <nav className="flex flex-col gap-1" aria-label={settingsSectionLabel}>
            <Link
              href={`${localePrefix}/settings`}
              className={navLinkClass}
              onClick={onNavigate}
            >
              <Settings className="size-4 shrink-0" aria-hidden />
              {settingsLinkLabel}
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
