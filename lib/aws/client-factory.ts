import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (client) return client;

  client = new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_REGION ?? "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
    },
  });

  return client;
}
