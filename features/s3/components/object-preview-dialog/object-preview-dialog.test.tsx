import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectPreviewDialog, TEXT_PREVIEW_MAX_BYTES } from "./object-preview-dialog";

// Mock classify-content-type so tests control categorization directly
vi.mock(
  "@/features/s3/components/object-preview-dialog/classify-content-type",
  () => ({
    classifyContentType: vi.fn(),
  }),
);

import { classifyContentType } from "@/features/s3/components/object-preview-dialog/classify-content-type";

const mockClassify = classifyContentType as ReturnType<typeof vi.fn>;

const dict = {
  title: "Preview",
  loading: "Loading preview…",
  unsupported: "This file type can't be previewed.",
  tooLarge: "File too large to preview (max 1 MB).",
  downloadInstead: "Download instead",
  error: "Couldn't load preview.",
};

const baseProps = {
  open: true,
  onClose: vi.fn(),
  object: { key: "photo.png", size: 1024, lastModified: "2024-01-01T00:00:00Z" },
  bucket: "my-bucket",
  dict,
  closeLabel: "Close",
};

function makeResponse(
  contentType: string,
  body: string | null = "",
  contentLength?: number,
): Response {
  const headers = new Headers({ "Content-Type": contentType });
  if (contentLength !== undefined) {
    headers.set("Content-Length", String(contentLength));
  }
  return {
    ok: true,
    headers,
    text: () => Promise.resolve(body ?? ""),
    status: 200,
  } as unknown as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("ObjectPreviewDialog", () => {
  it("shows loading state while fetch is in-flight", async () => {
    // fetch never resolves
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    mockClassify.mockReturnValue("image");

    render(<ObjectPreviewDialog {...baseProps} />);

    expect(screen.getByText(dict.loading)).toBeInTheDocument();
  });

  it("renders <img> for image branch (png)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(makeResponse("image/png"))),
    );
    mockClassify.mockReturnValue("image");

    render(<ObjectPreviewDialog {...baseProps} />);

    const img = await screen.findByRole("img");
    expect(img).toBeInTheDocument();
    expect((img as HTMLImageElement).src).toContain(
      "/api/aws/s3/my-bucket/objects/photo.png",
    );
    // Content area must not render inline SVG (img tag only, not <svg>)
    expect(img.tagName).toBe("IMG");
  });

  it("renders <img> for image/svg+xml (not inline <svg>)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(makeResponse("image/svg+xml"))),
    );
    mockClassify.mockReturnValue("image");

    const props = {
      ...baseProps,
      object: { key: "icon.svg", size: 512, lastModified: "2024-01-01T00:00:00Z" },
    };
    render(<ObjectPreviewDialog {...props} />);

    const img = await screen.findByRole("img");
    expect(img.tagName).toBe("IMG");
  });

  it("renders <pre> with text content for text branch (small file)", async () => {
    const textContent = "hello world";
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ...makeResponse("text/plain", textContent, textContent.length),
          text: () => Promise.resolve(textContent),
        }),
      ),
    );
    mockClassify.mockReturnValue("text");

    render(<ObjectPreviewDialog {...baseProps} />);

    const pre = await screen.findByText(textContent);
    expect(pre.tagName).toBe("PRE");
  });

  it("renders tooLarge message with Download button when Content-Length exceeds limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(makeResponse("text/csv", null, TEXT_PREVIEW_MAX_BYTES + 1)),
      ),
    );
    mockClassify.mockReturnValue("text");

    render(<ObjectPreviewDialog {...baseProps} />);

    await screen.findByText(dict.tooLarge);
    expect(screen.getByText(dict.downloadInstead)).toBeInTheDocument();
  });

  it("renders metadata card and Download button for unsupported branch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(makeResponse("application/octet-stream"))),
    );
    mockClassify.mockReturnValue("unsupported");

    render(<ObjectPreviewDialog {...baseProps} />);

    await screen.findByText(dict.unsupported);
    expect(screen.getByText(dict.downloadInstead)).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("pre")).toBeNull();
  });

  it("renders error message when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network error"))));
    mockClassify.mockReturnValue("image");

    render(<ObjectPreviewDialog {...baseProps} />);

    await screen.findByText(dict.error);
  });

  it("renders close button with sr-only label", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    mockClassify.mockReturnValue("image");

    render(<ObjectPreviewDialog {...baseProps} />);

    expect(screen.getByText("Close", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("TEXT_PREVIEW_MAX_BYTES is re-exported and equals 1048576", () => {
    expect(TEXT_PREVIEW_MAX_BYTES).toBe(1_048_576);
  });
});
