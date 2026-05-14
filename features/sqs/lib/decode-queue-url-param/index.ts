/**
 * Next.js decodes dynamic route params, but some proxies or manual URLs may
 * leave encoded segments; normalize before calling SQS APIs.
 */
export function decodeQueueUrlParam(queueUrlParam: string): string {
  try {
    return decodeURIComponent(queueUrlParam);
  } catch {
    return queueUrlParam;
  }
}

/** Rejects obvious garbage so malformed dynamic segments map to not-found UX. */
export function isLikelyQueueServiceUrl(decoded: string): boolean {
  try {
    const u = new URL(decoded);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
