import type { Preset } from "./schema";

export const ecommercePreset: Preset = {
  slug: "ecommerce",
  name: "E-Commerce",
  description:
    "Products catalog, orders queue, inventory table, and fulfillment function",
  s3: [
    { name: "loopback-ecommerce-products" },
    { name: "loopback-ecommerce-media" },
  ],
  sqs: [
    { name: "loopback-ecommerce-orders" },
    { name: "loopback-ecommerce-notifications" },
  ],
  dynamodb: [
    { name: "loopback-ecommerce-catalog", pk: "id" },
    { name: "loopback-ecommerce-users", pk: "userId" },
  ],
  lambda: [
    {
      name: "loopback-ecommerce-processor",
      runtime: "nodejs20.x",
      handler: "index.handler",
      role: "arn:aws:iam::000000000000:role/lambda-role",
    },
  ],
  sns: [{ name: "loopback-ecommerce-events" }],
};
