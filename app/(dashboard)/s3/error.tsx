"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function S3Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const endpoint = process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL ?? "your endpoint";

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6">
      <div>
        <h2 className="text-lg font-semibold text-destructive">Failed to connect to S3</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Could not reach <span className="font-mono">{endpoint}</span>. Make sure LocalStack is
          running and <code className="text-xs">AWS_ENDPOINT_URL</code> is configured correctly.
        </p>
        {error.message && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">{error.message}</p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={unstable_retry}>
        Retry
      </Button>
    </div>
  );
}
