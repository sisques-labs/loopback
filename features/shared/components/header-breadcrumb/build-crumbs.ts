import { services } from "@/lib/services-registry";
import { decodeQueueUrlParam } from "@/features/sqs/lib/decode-queue-url-param";
import { queueNameFromUrl } from "@/features/sqs/lib/queue-url-display";
import { decodeTopicArnParam } from "@/features/sns/lib/decode-topic-arn-param";
import type { Locale } from "@/features/shared/i18n/locale";

export type Crumb = { label: string; href?: string };

function decodeResourceLabel(slug: string, rawSegment: string): string {
  const decoded = (() => {
    try {
      return decodeURIComponent(rawSegment);
    } catch {
      return rawSegment;
    }
  })();

  switch (slug) {
    case "sqs": {
      const url = decodeQueueUrlParam(decoded);
      return queueNameFromUrl(url);
    }
    case "sns": {
      const arn = decodeTopicArnParam(decoded);
      const tail = arn.split(":").pop() ?? "";
      return tail.length > 0 ? tail : arn;
    }
    default:
      return decoded;
  }
}

export function buildCrumbs(
  pathname: string,
  locale: Locale,
  settingsLabel: string,
  terminalLabel?: string,
  dashboardLabel?: string,
): Crumb[] {
  const localePrefix = `/${locale}`;

  const withoutLocale = pathname.startsWith(localePrefix)
    ? pathname.slice(localePrefix.length)
    : pathname;

  const segments = withoutLocale.split("/").filter(Boolean);

  if (segments.length === 0) return [];

  const [serviceSlug, resourceSegment] = segments;

  if (serviceSlug === "settings") {
    return [{ label: settingsLabel }];
  }

  if (serviceSlug === "dashboard") {
    return [{ label: dashboardLabel ?? "Dashboard" }];
  }

  if (serviceSlug === "terminal") {
    return [{ label: terminalLabel ?? "Terminal" }];
  }

  const service = services.find((s) => s.slug === serviceSlug);
  if (!service) return [];

  const serviceHref = `${localePrefix}${service.href}`;

  if (!resourceSegment) {
    return [{ label: service.label }];
  }

  const resourceLabel = decodeResourceLabel(serviceSlug, resourceSegment);

  return [
    { label: service.label, href: serviceHref },
    { label: resourceLabel },
  ];
}
