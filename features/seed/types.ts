export type ServiceKey = "s3" | "sqs" | "dynamodb" | "lambda" | "sns";

export type ServiceResult = {
  service: ServiceKey;
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
};

export type LoadReport = {
  results: ServiceResult[];
};

export type ResetReport = {
  results: ServiceResult[];
  dryRun: boolean;
};
