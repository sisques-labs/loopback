// Hand-written types and guard — no Zod, zero new dependencies.

export type S3Resource = { name: string };
export type SQSResource = { name: string; fifo?: boolean };
export type DynamoDBResource = { name: string; pk: string };
export type LambdaResource = { name: string; runtime: string; handler: string; role: string };
export type SNSResource = { name: string };

export type PresetSlug = "ecommerce" | "blog" | "event-driven";

export type Preset = {
  slug: PresetSlug;
  s3: S3Resource[];
  sqs: SQSResource[];
  dynamodb: DynamoDBResource[];
  lambda: LambdaResource[];
  sns: SNSResource[];
};

const VALID_SLUGS: ReadonlySet<string> = new Set<PresetSlug>([
  "ecommerce",
  "blog",
  "event-driven",
]);

export function isPresetSlug(x: unknown): x is PresetSlug {
  return typeof x === "string" && VALID_SLUGS.has(x);
}
