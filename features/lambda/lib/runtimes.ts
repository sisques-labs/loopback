import type { Runtime } from "@aws-sdk/client-lambda";

export const SUPPORTED_RUNTIMES = [
  "nodejs20.x",
  "nodejs18.x",
  "python3.12",
  "python3.11",
  "java21",
  "go1.x",
  "dotnet8",
  "provided.al2023",
] as const satisfies readonly Runtime[];

export type SupportedRuntime = (typeof SUPPORTED_RUNTIMES)[number];

export const DEFAULT_LAMBDA_ROLE_ARN = "arn:aws:iam::000000000000:role/lambda-role";
export const DEFAULT_HANDLER = "index.handler";
export const MAX_ZIP_BYTES = 50 * 1024 * 1024; // 50 MB
