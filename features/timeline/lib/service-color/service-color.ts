type ServiceColorClasses = {
  badge: string;
  spine: string;
};

const SERVICE_COLORS: Record<string, ServiceColorClasses> = {
  lambda: {
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    spine: "bg-blue-500",
  },
  s3: {
    badge: "bg-green-500/10 text-green-600 border-green-500/20",
    spine: "bg-green-500",
  },
  sns: {
    badge: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    spine: "bg-purple-500",
  },
  sqs: {
    badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    spine: "bg-orange-500",
  },
  dynamodb: {
    badge: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    spine: "bg-yellow-500",
  },
  logs: {
    badge: "bg-muted text-muted-foreground border-border",
    spine: "bg-muted-foreground",
  },
};

export function getServiceColorClasses(service: string): ServiceColorClasses {
  return SERVICE_COLORS[service.toLowerCase()] ?? SERVICE_COLORS.logs;
}
