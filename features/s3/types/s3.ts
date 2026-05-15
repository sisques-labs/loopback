export type Bucket = {
  name: string;
  createdAt: string;
  region?: string;
};

export type S3Object = {
  key: string;
  size: number;
  lastModified: string;
  etag?: string;
  storageClass?: string;
};

export type UploadResult =
  | { ok: true; key: string; size: number }
  | { ok: false; error: string; code?: string };
