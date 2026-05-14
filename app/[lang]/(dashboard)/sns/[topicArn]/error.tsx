"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getErrorStrings } from "@/features/sns/i18n/error-strings";
import { t } from "@/features/shared/i18n/interpolate";

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

  useEffect(() => {
    console.error(error);
  }, [error]);

  const endpoint = process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL ?? "http://localhost:4566";

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6">
      <div>
        <h2 className="text-lg font-semibold text-destructive">{strings.connectFailed}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(strings.connectFailedDetail, { endpoint })}
        </p>
        {error.message && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">{error.message}</p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => unstable_retry()}>
        {strings.retry}
      </Button>
    </div>
  );
}
