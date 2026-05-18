import "server-only";
import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { createAwsConfig } from "@/lib/aws/config";

// No module-level singleton by design — createAwsConfig() is per-request so the
// endpoint cookie override takes effect on every call. Rebuilding a thin SDK client
// object is negligible overhead against network latency.
export async function getCloudWatchLogsClient(): Promise<CloudWatchLogsClient> {
  const config = await createAwsConfig();
  return new CloudWatchLogsClient(config);
}
