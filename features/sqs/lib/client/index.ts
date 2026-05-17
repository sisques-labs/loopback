import "server-only";
import { SQSClient } from "@aws-sdk/client-sqs";
import { createAwsConfig } from "@/lib/aws/config";

// No module-level singleton by design — createAwsConfig() is per-request so the
// endpoint cookie override takes effect on every call. Rebuilding a thin SDK client
// object is microseconds against LocalStack network latency.
export async function getSQSClient(): Promise<SQSClient> {
  const config = await createAwsConfig();
  return new SQSClient(config);
}
