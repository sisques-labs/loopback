// ── DynamoDB section ──────────────────────────────────────────────────

export type DynamoDBAttributeDefinition = {
  name: string;
  type: "S" | "N" | "B";
};

export type DynamoDBKeySchema = {
  name: string;
  keyType: "HASH" | "RANGE";
};

export type DynamoDBGSISnapshot = {
  indexName: string;
  keySchema: DynamoDBKeySchema[];
  projection: { projectionType: string; nonKeyAttributes?: string[] };
};

export type DynamoDBTableSnapshot = {
  tableName: string;
  billingMode: "PAY_PER_REQUEST" | "PROVISIONED";
  attributeDefinitions: DynamoDBAttributeDefinition[];
  keySchema: DynamoDBKeySchema[];
  provisionedThroughput?: { readCapacityUnits: number; writeCapacityUnits: number };
  globalSecondaryIndexes?: DynamoDBGSISnapshot[];
  items: Record<string, unknown>[]; // already unmarshalled via @aws-sdk/util-dynamodb
  itemCount: number;
};

// ── SQS section ───────────────────────────────────────────────────────

export type SQSQueueSnapshot = {
  queueName: string;
  isFifo: boolean;
  attributes: Record<string, string>; // raw GetQueueAttributes["All"] output
};

// ── S3 section ────────────────────────────────────────────────────────

export type S3ObjectMetadata = {
  key: string;
  size: number;
  lastModified: string; // ISO-8601
  contentType?: string;
  etag?: string;
};

export type S3BucketSnapshot = {
  bucketName: string;
  objects: S3ObjectMetadata[];
};

// ── Top-level document ────────────────────────────────────────────────

export type SnapshotDocument = {
  version: "1";
  createdAt: string; // ISO-8601
  endpoint: string; // captured at create time (informational)
  dynamodb: DynamoDBTableSnapshot[];
  sqs: SQSQueueSnapshot[];
  s3: S3BucketSnapshot[];
};

// ── Restore report ────────────────────────────────────────────────────

export type RestoreResourceResult = {
  name: string;
  status: "created" | "skipped" | "failed";
  error?: string;
};

export type RestoreServiceReport = {
  service: "dynamodb" | "sqs" | "s3";
  resources: RestoreResourceResult[];
};

export type RestoreReport = {
  services: RestoreServiceReport[];
};

// ── Zustand store ─────────────────────────────────────────────────────

export type SnapshotStatus = "idle" | "creating" | "restoring" | "done" | "error";

export interface SnapshotStoreState {
  snapshot: SnapshotDocument | null;
  status: SnapshotStatus;
  restoreReport: RestoreReport | null;
  errorMessage: string | null;

  setSnapshot(doc: SnapshotDocument): void;
  clearSnapshot(): void;
  setStatus(s: SnapshotStatus): void;
  setRestoreReport(r: RestoreReport): void;
  setError(msg: string): void;
  reset(): void;
}
