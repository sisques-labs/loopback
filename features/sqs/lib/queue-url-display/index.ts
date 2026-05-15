export function queueNameFromUrl(queueUrl: string): string {
  try {
    const u = new URL(queueUrl);
    const segments = u.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? queueUrl;
  } catch {
    return queueUrl;
  }
}
