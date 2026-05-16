import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..", "..");

/** NFR-2.2: client feature delta budget (source gzip proxy; build output ~2KB). */
const FEATURE_SOURCES = [
  "features/shared/components/header-breadcrumb/build-crumbs.ts",
  "features/shared/components/header-breadcrumb/header-breadcrumb.tsx",
  "components/ui/breadcrumb.tsx",
];

const MAX_GZIP_BYTES = 5 * 1024;

describe("header-breadcrumb bundle budget (NFR-2)", () => {
  it("owned feature modules gzip under 5KB", () => {
    const totalGzipBytes = FEATURE_SOURCES.reduce((sum, relativePath) => {
      const source = readFileSync(join(ROOT, relativePath));
      return sum + gzipSync(source).length;
    }, 0);

    expect(totalGzipBytes).toBeLessThan(MAX_GZIP_BYTES);
  });
});
