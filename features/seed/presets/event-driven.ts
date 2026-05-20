import type { Preset } from "./schema";

export const eventDrivenPreset: Preset = {
  slug: "event-driven",
  s3: [],
  sqs: [
    { name: "loopback-event-ingestion" },
    { name: "loopback-event-dlq" },
  ],
  dynamodb: [{ name: "loopback-event-store", pk: "eventId" }],
  lambda: [
    {
      name: "loopback-event-consumer",
      runtime: "nodejs20.x",
      handler: "index.handler",
      role: "arn:aws:iam::000000000000:role/lambda-role",
    },
    {
      name: "loopback-event-router",
      runtime: "nodejs20.x",
      handler: "index.handler",
      role: "arn:aws:iam::000000000000:role/lambda-role",
    },
  ],
  sns: [
    { name: "loopback-event-fanout" },
    { name: "loopback-event-alerts" },
  ],
};
