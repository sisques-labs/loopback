import "server-only";
import { SNSClient } from "@aws-sdk/client-sns";
import { createAwsConfig } from "@/lib/aws/config";

// No module-level singleton by design — createAwsConfig() is per-request so the
// endpoint cookie override takes effect on every call. Rebuilding a thin SDK client
// object is microseconds against LocalStack network latency.
export async function getSNSClient(): Promise<SNSClient> {
  const config = await createAwsConfig();
  return new SNSClient(config);
}
