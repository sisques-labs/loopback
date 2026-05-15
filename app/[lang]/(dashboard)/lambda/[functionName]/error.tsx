"use client";

import { usePathname } from "next/navigation";
import { LambdaErrorPanel } from "@/features/lambda/components/lambda-error-panel/lambda-error-panel";
import { getLambdaErrorStrings } from "@/features/lambda/i18n/error-strings";
import { DEFAULT_LOCALE } from "@/features/shared/i18n/locale";

export default function LambdaFunctionDetailError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const localeSegment = pathname.split("/")[1];
  const strings = getLambdaErrorStrings(localeSegment);
  const localePrefix = `/${localeSegment ?? DEFAULT_LOCALE}`;

  return (
    <LambdaErrorPanel error={error} unstable_retry={unstable_retry} strings={strings} localePrefix={localePrefix} />
  );
}
