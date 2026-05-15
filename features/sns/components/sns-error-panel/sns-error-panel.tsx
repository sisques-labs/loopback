"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ErrorStrings } from "@/features/sns/i18n/error-strings";
import { t } from "@/features/shared/i18n/interpolate";
import { cn } from "@/lib/utils";

function isSnsTopicNotFoundError(error: Error): boolean {
  return error.name === "NotFoundException" || error.message.includes("does not exist");
}

type Props = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
  strings: ErrorStrings;
  localePrefix: string;
};

export function SnsErrorPanel({ error, unstable_retry, strings, localePrefix }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const publicEndpoint = process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL?.trim();

  if (isSnsTopicNotFoundError(error)) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <div>
          <h2 className="text-lg font-semibold text-destructive">{strings.topicNotFound}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{strings.topicNotFoundDetail}</p>
          {error.message && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">{error.message}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${localePrefix}/sns`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {strings.backToTopics}
          </Link>
          <Button variant="outline" size="sm" onClick={() => unstable_retry()}>
            {strings.retry}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6">
      <div>
        <h2 className="text-lg font-semibold text-destructive">{strings.connectFailed}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {publicEndpoint
            ? t(strings.connectFailedDetail, { endpoint: publicEndpoint })
            : strings.connectFailedDetailGeneric}
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
