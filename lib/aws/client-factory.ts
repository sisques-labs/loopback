import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { createAwsConfig } from "@/lib/aws/config";
import { withInspectorMiddleware } from "@/lib/aws/inspector-middleware";

/**
 * Creates a fresh S3Client on every call.
 *
 * IMPORTANT: There is intentionally NO module-level cache here.
 * The endpoint is resolved from the httpOnly cookie per request so that
 * an endpoint override set via the Settings UI takes effect immediately
 * without a process restart.
 *
 * forcePathStyle: true is REQUIRED for LocalStack path-style S3 addressing.
 * Do NOT remove this option.
 */
export async function getS3Client(): Promise<S3Client> {
  const config = await createAwsConfig();
  return withInspectorMiddleware(new S3Client({ ...config, forcePathStyle: true }), "S3");
}
