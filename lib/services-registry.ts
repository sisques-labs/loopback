import { Database, FunctionSquare, MessageSquare, Rss, Server } from "lucide-react";
import type { ServiceEntry } from "@/types/aws";

export const services: ServiceEntry[] = [
  {
    slug: "s3",
    label: "S3",
    icon: Server,
    href: "/s3",
    status: "enabled",
  },
  {
    slug: "sqs",
    label: "SQS",
    icon: MessageSquare,
    href: "/sqs",
    status: "coming-soon",
  },
  {
    slug: "dynamodb",
    label: "DynamoDB",
    icon: Database,
    href: "/dynamodb",
    status: "coming-soon",
  },
  {
    slug: "lambda",
    label: "Lambda",
    icon: FunctionSquare,
    href: "/lambda",
    status: "coming-soon",
  },
  {
    slug: "sns",
    label: "SNS",
    icon: Rss,
    href: "/sns",
    status: "coming-soon",
  },
];
