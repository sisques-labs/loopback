import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let _raw: DynamoDBClient | undefined;
let _doc: DynamoDBDocumentClient | undefined;

export function getDynamoDBClient(): DynamoDBClient {
  if (_raw) return _raw;

  _raw = new DynamoDBClient({
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
    },
  });

  return _raw;
}

export function getDynamoDBDocumentClient(): DynamoDBDocumentClient {
  if (_doc) return _doc;

  _doc = DynamoDBDocumentClient.from(getDynamoDBClient(), {
    marshallOptions: { removeUndefinedValues: true },
  });

  return _doc;
}
