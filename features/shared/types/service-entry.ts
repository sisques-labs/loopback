import type { LucideIcon } from "lucide-react";

export type ServiceEntry = {
  slug: "s3" | "sqs" | "dynamodb" | "lambda" | "sns";
  label: string;
  icon: LucideIcon;
  href: string;
  status: "enabled" | "coming-soon";
};

export type ToolEntry = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
};
