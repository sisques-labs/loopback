import type { Preset } from "./schema";

export const blogPreset: Preset = {
  slug: "blog",
  name: "Blog",
  description:
    "Content bucket, posts table, notifications topic, and publishing function",
  s3: [{ name: "loopback-blog-assets" }],
  sqs: [{ name: "loopback-blog-comments" }],
  dynamodb: [
    { name: "loopback-blog-posts", pk: "postId" },
    { name: "loopback-blog-authors", pk: "authorId" },
  ],
  lambda: [
    {
      name: "loopback-blog-publisher",
      runtime: "nodejs20.x",
      handler: "index.handler",
      role: "arn:aws:iam::000000000000:role/lambda-role",
    },
  ],
  sns: [{ name: "loopback-blog-updates" }],
};
