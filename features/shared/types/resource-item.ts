export type ResourceItem = {
  id: string;
  label: string;
  kind: "s3" | "sqs" | "lambda" | "sns" | "dynamodb";
  href: string;
};
