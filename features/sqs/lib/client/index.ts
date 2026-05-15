import "server-only";
import { SQSClient } from "@aws-sdk/client-sqs";

let _client: SQSClient | undefined;

export function getSQSClient(): SQSClient {
  if (_client) return _client;

  _client = new SQSClient({
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
    },
  });

  return _client;
}
