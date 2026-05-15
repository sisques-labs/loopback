"use client";

import { usePathname } from "next/navigation";
import { DynamoDBErrorPanel } from "@/features/dynamodb/components/dynamodb-error-panel/dynamodb-error-panel";
import { getDynamoDBErrorStrings } from "@/features/dynamodb/i18n/error-strings";
import { DEFAULT_LOCALE } from "@/features/shared/i18n/locale";

export default function DynamoDBTableError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const localeSegment = pathname.split("/")[1];
  const strings = getDynamoDBErrorStrings(localeSegment);
  const localePrefix = `/${localeSegment ?? DEFAULT_LOCALE}`;

  return (
    <DynamoDBErrorPanel
      error={error}
      unstable_retry={unstable_retry}
      strings={strings}
      localePrefix={localePrefix}
    />
  );
}
