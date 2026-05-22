export type RequestStatus = "success" | "error";

export type RequestEntry = {
  id: string; // crypto.randomUUID()
  timestamp: number; // epoch ms — when middleware called next()
  service: string; // e.g. "SQS", "DynamoDB", "S3"
  operation: string; // command class name, e.g. "SendMessageCommand"
  input: unknown; // sanitized input (see truncation rules)
  output: unknown; // sanitized output (success only); undefined on error
  durationMs: number; // Date.now() delta around next()
  status: RequestStatus;
  error?: {
    name: string;
    message: string;
    code?: string; // SDK error name like "ResourceNotFoundException"
    statusCode?: number; // HTTP status from $metadata
  };
  attempts: number; // $metadata.attempts (>= 1)
};

export type RequestFilters = {
  service: string; // "" = all
  status: "all" | "success" | "error";
  text: string; // free-text match on operation + input/output JSON
};
