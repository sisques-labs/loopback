/**
 * Next.js decodes dynamic route params, but some proxies or manual URLs may
 * leave encoded segments; normalize before calling SNS APIs.
 */
export function decodeTopicArnParam(topicArnParam: string): string {
  try {
    return decodeURIComponent(topicArnParam);
  } catch {
    return topicArnParam;
  }
}
