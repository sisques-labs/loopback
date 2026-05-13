import type { LucideIcon } from "lucide-react";

export type Bucket = {
  name: string;
  createdAt: string;
  region?: string;
};

export type S3Object = {
  key: string;
  size: number;
  lastModified: string;
  etag?: string;
  storageClass?: string;
};

export type UploadResult =
  | { ok: true; key: string; size: number }
  | { ok: false; error: string; code?: string };

export type ActionState<T = void> =
  | { status: "idle" }
  | { status: "success"; data: T }
  | { status: "error"; message: string; code?: string };

export type ServiceEntry = {
  slug: "s3" | "sqs" | "dynamodb" | "lambda" | "sns";
  label: string;
  icon: LucideIcon;
  href: string;
  status: "enabled" | "coming-soon";
};
