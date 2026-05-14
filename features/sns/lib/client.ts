import "server-only";
import { SNSClient } from "@aws-sdk/client-sns";

let _client: SNSClient | undefined;

export function getSNSClient(): SNSClient {
  if (_client) return _client;

  _client = new SNSClient({
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
    },
  });

  return _client;
}
