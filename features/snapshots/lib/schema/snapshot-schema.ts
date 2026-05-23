import { z } from "zod";

// ── Nested schemas ────────────────────────────────────────────────────

const dynamoDBAttributeDefinitionSchema = z.object({
  name: z.string(),
  type: z.enum(["S", "N", "B"]),
});

const dynamoDBKeySchemaSchema = z.object({
  name: z.string(),
  keyType: z.enum(["HASH", "RANGE"]),
});

const dynamoDBGSISnapshotSchema = z.object({
  indexName: z.string(),
  keySchema: z.array(dynamoDBKeySchemaSchema),
  projection: z.object({
    projectionType: z.string(),
    nonKeyAttributes: z.array(z.string()).optional(),
  }),
});

const dynamoDBTableSnapshotSchema = z.object({
  tableName: z.string(),
  billingMode: z.enum(["PAY_PER_REQUEST", "PROVISIONED"]),
  attributeDefinitions: z.array(dynamoDBAttributeDefinitionSchema),
  keySchema: z.array(dynamoDBKeySchemaSchema),
  provisionedThroughput: z
    .object({
      readCapacityUnits: z.number(),
      writeCapacityUnits: z.number(),
    })
    .optional(),
  globalSecondaryIndexes: z.array(dynamoDBGSISnapshotSchema).optional(),
  items: z.array(z.record(z.unknown())),
  itemCount: z.number(),
});

const sqsQueueSnapshotSchema = z.object({
  queueName: z.string(),
  isFifo: z.boolean(),
  attributes: z.record(z.string()),
});

const s3ObjectMetadataSchema = z.object({
  key: z.string(),
  size: z.number(),
  lastModified: z.string(),
  contentType: z.string().optional(),
  etag: z.string().optional(),
});

const s3BucketSnapshotSchema = z.object({
  bucketName: z.string(),
  objects: z.array(s3ObjectMetadataSchema),
});

// ── Top-level document schema ─────────────────────────────────────────

export const snapshotDocumentSchema = z.object({
  version: z.literal("1"),
  createdAt: z.string(),
  endpoint: z.string(),
  dynamodb: z.array(dynamoDBTableSnapshotSchema),
  sqs: z.array(sqsQueueSnapshotSchema),
  s3: z.array(s3BucketSnapshotSchema),
});

export type SnapshotDocumentParsed = z.infer<typeof snapshotDocumentSchema>;
