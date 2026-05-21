import { describe, expectTypeOf, it } from "vitest";
import type {
  DynamoDBAttributeDefinition,
  DynamoDBGSISnapshot,
  DynamoDBKeySchema,
  DynamoDBTableSnapshot,
  RestoreReport,
  RestoreResourceResult,
  RestoreServiceReport,
  S3BucketSnapshot,
  S3ObjectMetadata,
  SQSQueueSnapshot,
  SnapshotDocument,
  SnapshotStatus,
  SnapshotStoreState,
} from "./snapshot";

describe("snapshot types", () => {
  it("SnapshotDocument has version, createdAt, endpoint, dynamodb, sqs, s3", () => {
    const doc: SnapshotDocument = {
      version: "1",
      createdAt: new Date().toISOString(),
      endpoint: "http://localhost:4566",
      dynamodb: [],
      sqs: [],
      s3: [],
    };
    expectTypeOf(doc.version).toEqualTypeOf<"1">();
    expectTypeOf(doc.createdAt).toEqualTypeOf<string>();
    expectTypeOf(doc.endpoint).toEqualTypeOf<string>();
    expectTypeOf(doc.dynamodb).toEqualTypeOf<DynamoDBTableSnapshot[]>();
    expectTypeOf(doc.sqs).toEqualTypeOf<SQSQueueSnapshot[]>();
    expectTypeOf(doc.s3).toEqualTypeOf<S3BucketSnapshot[]>();
  });

  it("DynamoDBTableSnapshot has correct shape", () => {
    const table: DynamoDBTableSnapshot = {
      tableName: "Users",
      billingMode: "PAY_PER_REQUEST",
      attributeDefinitions: [],
      keySchema: [],
      items: [],
      itemCount: 0,
    };
    expectTypeOf(table.tableName).toEqualTypeOf<string>();
    expectTypeOf(table.billingMode).toEqualTypeOf<"PAY_PER_REQUEST" | "PROVISIONED">();
    expectTypeOf(table.attributeDefinitions).toEqualTypeOf<DynamoDBAttributeDefinition[]>();
    expectTypeOf(table.keySchema).toEqualTypeOf<DynamoDBKeySchema[]>();
    expectTypeOf(table.items).toEqualTypeOf<Record<string, unknown>[]>();
    expectTypeOf(table.itemCount).toEqualTypeOf<number>();
  });

  it("DynamoDBAttributeDefinition accepts only S, N, B types", () => {
    const attr: DynamoDBAttributeDefinition = { name: "pk", type: "S" };
    expectTypeOf(attr.type).toEqualTypeOf<"S" | "N" | "B">();
  });

  it("DynamoDBKeySchema accepts only HASH and RANGE keyTypes", () => {
    const key: DynamoDBKeySchema = { name: "pk", keyType: "HASH" };
    expectTypeOf(key.keyType).toEqualTypeOf<"HASH" | "RANGE">();
  });

  it("DynamoDBGSISnapshot has indexName, keySchema, projection", () => {
    const gsi: DynamoDBGSISnapshot = {
      indexName: "gsi-1",
      keySchema: [{ name: "sk", keyType: "RANGE" }],
      projection: { projectionType: "ALL" },
    };
    expectTypeOf(gsi.indexName).toEqualTypeOf<string>();
  });

  it("SQSQueueSnapshot has queueName, isFifo, attributes", () => {
    const queue: SQSQueueSnapshot = {
      queueName: "orders",
      isFifo: false,
      attributes: {},
    };
    expectTypeOf(queue.isFifo).toEqualTypeOf<boolean>();
    expectTypeOf(queue.attributes).toEqualTypeOf<Record<string, string>>();
  });

  it("S3ObjectMetadata has required and optional fields", () => {
    const obj: S3ObjectMetadata = {
      key: "file.txt",
      size: 1024,
      lastModified: new Date().toISOString(),
    };
    expectTypeOf(obj.key).toEqualTypeOf<string>();
    expectTypeOf(obj.size).toEqualTypeOf<number>();
    expectTypeOf(obj.contentType).toEqualTypeOf<string | undefined>();
    expectTypeOf(obj.etag).toEqualTypeOf<string | undefined>();
  });

  it("S3BucketSnapshot has bucketName and objects", () => {
    const bucket: S3BucketSnapshot = { bucketName: "my-bucket", objects: [] };
    expectTypeOf(bucket.objects).toEqualTypeOf<S3ObjectMetadata[]>();
  });

  it("RestoreResourceResult has name, status, optional error", () => {
    const r: RestoreResourceResult = { name: "Users", status: "created" };
    expectTypeOf(r.status).toEqualTypeOf<"created" | "skipped" | "failed">();
    expectTypeOf(r.error).toEqualTypeOf<string | undefined>();
  });

  it("RestoreServiceReport has service and resources", () => {
    const report: RestoreServiceReport = { service: "dynamodb", resources: [] };
    expectTypeOf(report.service).toEqualTypeOf<"dynamodb" | "sqs" | "s3">();
  });

  it("RestoreReport has services array", () => {
    const report: RestoreReport = { services: [] };
    expectTypeOf(report.services).toEqualTypeOf<RestoreServiceReport[]>();
  });

  it("SnapshotStatus accepts all valid literals", () => {
    const s: SnapshotStatus = "idle";
    expectTypeOf(s).toEqualTypeOf<"idle" | "creating" | "restoring" | "done" | "error">();
  });

  it("SnapshotStoreState has all required state and actions", () => {
    expectTypeOf<SnapshotStoreState["snapshot"]>().toEqualTypeOf<SnapshotDocument | null>();
    expectTypeOf<SnapshotStoreState["status"]>().toEqualTypeOf<SnapshotStatus>();
    expectTypeOf<SnapshotStoreState["restoreReport"]>().toEqualTypeOf<RestoreReport | null>();
    expectTypeOf<SnapshotStoreState["errorMessage"]>().toEqualTypeOf<string | null>();
    expectTypeOf<SnapshotStoreState["setSnapshot"]>().toEqualTypeOf<(doc: SnapshotDocument) => void>();
    expectTypeOf<SnapshotStoreState["clearSnapshot"]>().toEqualTypeOf<() => void>();
    expectTypeOf<SnapshotStoreState["setStatus"]>().toEqualTypeOf<(s: SnapshotStatus) => void>();
    expectTypeOf<SnapshotStoreState["setRestoreReport"]>().toEqualTypeOf<(r: RestoreReport) => void>();
    expectTypeOf<SnapshotStoreState["setError"]>().toEqualTypeOf<(msg: string) => void>();
    expectTypeOf<SnapshotStoreState["reset"]>().toEqualTypeOf<() => void>();
  });
});
