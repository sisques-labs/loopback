"use client";

import { usePathname } from "next/navigation";
import { SqsErrorPanel } from "@/features/sqs/components/sqs-error-panel/sqs-error-panel";
import { getSqsErrorStrings } from "@/features/sqs/i18n/error-strings";
import { DEFAULT_LOCALE } from "@/features/shared/i18n/locale";

export default function SQSError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const localeSegment = pathname.split("/")[1];
  const strings = getSqsErrorStrings(localeSegment);
  const localePrefix = `/${localeSegment ?? DEFAULT_LOCALE}`;

  return (
    <SqsErrorPanel
      error={error}
      unstable_retry={unstable_retry}
      strings={strings}
      localePrefix={localePrefix}
    />
  );
}
