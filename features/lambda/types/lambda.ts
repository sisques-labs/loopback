export interface InvokeHistoryEntry {
  id: string; // crypto.randomUUID()
  functionName: string;
  payloadHash: string; // 8-char SHA-256 hex prefix
  statusCode: number;
  duration: number; // ms; client-measured
  timestamp: string; // ISO-8601
  functionError?: string;
}

export interface LambdaFunction {
  functionName: string;
  functionArn: string;
  runtime: string; // "" when unknown
  handler: string; // "" when unknown
  description: string; // "" when null
  timeout: number; // 0 when unknown
  memorySize: number; // 0 when unknown
  lastModified: string; // raw ISO-ish string from SDK
  state: string; // "Active" | "Pending" | "Failed" | "Inactive" | ""
}

export interface InvokeResult {
  statusCode: number;
  body: string;
  functionError?: string; // "Handled" | "Unhandled" when present
}
