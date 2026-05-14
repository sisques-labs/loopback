export function encodeQueueUrlForRoute(queueUrl: string): string {
  return encodeURIComponent(queueUrl);
}
