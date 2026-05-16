export type PreviewCategory = "image" | "text" | "unsupported";

const IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const TEXT_MIMES = new Set([
  "application/json",
  "application/xml",
  "application/x-yaml",
]);

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

const TEXT_EXTS = new Set([
  ".md",
  ".txt",
  ".csv",
  ".json",
  ".yaml",
  ".yml",
  ".xml",
  ".ts",
  ".js",
  ".html",
  ".css",
]);

export function classifyContentType(
  contentType?: string,
  key?: string,
): PreviewCategory {
  if (contentType && IMAGE_MIMES.has(contentType)) return "image";
  if (
    contentType &&
    (contentType.startsWith("text/") || TEXT_MIMES.has(contentType))
  )
    return "text";

  // Extension fallback for missing or generic binary types
  if (!contentType || contentType === "application/octet-stream") {
    const ext = key ? "." + key.split(".").pop()!.toLowerCase() : "";
    if (IMAGE_EXTS.has(ext)) return "image";
    if (TEXT_EXTS.has(ext)) return "text";
    return "unsupported";
  }

  return "unsupported";
}
