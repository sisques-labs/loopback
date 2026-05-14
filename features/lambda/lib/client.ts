import "server-only";
import { LambdaClient } from "@aws-sdk/client-lambda";

let _client: LambdaClient | undefined;

export function getLambdaClient(): LambdaClient {
  if (_client) return _client;

  _client = new LambdaClient({
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
    },
  });

  return _client;
}
