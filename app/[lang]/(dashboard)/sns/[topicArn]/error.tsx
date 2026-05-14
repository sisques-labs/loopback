"use client";

import { usePathname } from "next/navigation";
import { SnsErrorPanel } from "@/features/sns/components/sns-error-panel/sns-error-panel";
import { getErrorStrings } from "@/features/sns/i18n/error-strings";
import { DEFAULT_LOCALE } from "@/features/shared/i18n/locale";

export default function TopicDetailError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const localeSegment = pathname.split("/")[1];
  const strings = getErrorStrings(localeSegment);
  const localePrefix = `/${localeSegment ?? DEFAULT_LOCALE}`;

  return (
    <SnsErrorPanel error={error} unstable_retry={unstable_retry} strings={strings} localePrefix={localePrefix} />
  );
}
