import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectMetadataDialog } from "./object-metadata-dialog";

const dict = {
  title: "Object metadata",
  loading: "Loading metadata…",
  error: "Couldn't load metadata.",
  size: "Size",
  contentType: "Content type",
  etag: "ETag",
  storageClass: "Storage class",
  lastModified: "Last modified",
  customSection: "Custom metadata",
  noCustom: "No custom metadata.",
  notAvailable: "—",
};

const baseProps = {
  open: true,
  onClose: vi.fn(),
  bucket: "my-bucket",
  objectKey: "photo.png",
  dict,
  closeLabel: "Close",
};

const successObject = {
  key: "photo.png",
  size: 2048,
  lastModified: "2024-01-01T00:00:00Z",
  etag: "abc123",
  contentType: "image/png",
  storageClass: "STANDARD",
};

function makeSuccessResponse(object: object) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ok: true, data: object }),
  } as unknown as Response);
}

function makeErrorResponse(status = 404) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ ok: false, error: "Not found" }),
  } as unknown as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("ObjectMetadataDialog", () => {
  it("shows loading state while fetch is in-flight", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    render(<ObjectMetadataDialog {...baseProps} />);

    expect(screen.getByText(dict.loading)).toBeInTheDocument();
  });

  it("renders system metadata fields on success", async () => {
    vi.stubGlobal("fetch", vi.fn(() => makeSuccessResponse(successObject)));

    render(<ObjectMetadataDialog {...baseProps} />);

    await screen.findByText("image/png");
    expect(screen.getByText("abc123")).toBeInTheDocument();
    expect(screen.getByText("STANDARD")).toBeInTheDocument();
  });

  it("renders custom metadata key-value pairs when present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        makeSuccessResponse({ ...successObject, metadata: { foo: "bar", env: "prod" } }),
      ),
    );

    render(<ObjectMetadataDialog {...baseProps} />);

    await screen.findByText("foo");
    expect(screen.getByText("bar")).toBeInTheDocument();
    expect(screen.getByText("env")).toBeInTheDocument();
    expect(screen.getByText("prod")).toBeInTheDocument();
  });

  it("renders no-custom-metadata empty state when metadata is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => makeSuccessResponse({ ...successObject, metadata: undefined })),
    );

    render(<ObjectMetadataDialog {...baseProps} />);

    await screen.findByText(dict.noCustom);
  });

  it("renders error state when fetch returns !res.ok", async () => {
    vi.stubGlobal("fetch", vi.fn(() => makeErrorResponse(404)));

    render(<ObjectMetadataDialog {...baseProps} />);

    await screen.findByText(dict.error);
    expect(screen.queryByText(dict.loading)).not.toBeInTheDocument();
  });

  it("renders error state when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network error"))));

    render(<ObjectMetadataDialog {...baseProps} />);

    await screen.findByText(dict.error);
  });

  it("renders close button with sr-only label", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    render(<ObjectMetadataDialog {...baseProps} />);

    expect(screen.getByText("Close", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("does not fetch when open is false", () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    render(<ObjectMetadataDialog {...baseProps} open={false} />);

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
