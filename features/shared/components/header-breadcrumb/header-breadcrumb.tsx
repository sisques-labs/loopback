"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buildCrumbs } from "./build-crumbs";
import type { Locale } from "@/features/shared/i18n/locale";

/** Height + padding on mobile; fixed min-width from sm (header is narrow beside menu). */
const crumbTouchTarget =
  "inline-flex min-h-11 min-w-0 items-center justify-start px-3 leading-none sm:min-w-11 sm:justify-center sm:px-0 md:min-h-9 md:min-w-9";

const crumbPageClass = `${crumbTouchTarget} min-w-0 max-w-full flex-1 truncate sm:max-w-[30ch] sm:flex-none`;

type Props = {
  locale: Locale;
  settingsLabel: string;
  terminalLabel?: string;
  dashboardLabel?: string;
};

export function HeaderBreadcrumb({
  locale,
  settingsLabel,
  terminalLabel,
  dashboardLabel,
}: Props) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(
    pathname,
    locale,
    settingsLabel,
    terminalLabel,
    dashboardLabel,
  );

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb className="flex h-full min-w-0 items-center">
      <BreadcrumbList className="min-w-0 flex-nowrap items-center gap-0.5 overflow-hidden sm:gap-1">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={crumb.href ?? crumb.label}>
              {index > 0 && (
                <BreadcrumbSeparator className="hidden shrink-0 items-center sm:inline-flex" />
              )}
              <BreadcrumbItem
                className={
                  isLast
                    ? "inline-flex min-w-0 flex-1 items-center"
                    : "hidden min-w-0 sm:inline-flex"
                }
              >
                {crumb.href ? (
                  <BreadcrumbLink href={crumb.href} className={crumbTouchTarget}>
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className={crumbPageClass}>
                    {crumb.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
