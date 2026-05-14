const dict = {
  page: {
    title: "S3 Buckets",
    empty: "No buckets found in this account.",
  },
  bucketDetail: {
    empty: "This bucket is empty.",
  },
  bucketTable: {
    name: "Name",
    created: "Created",
  },
  objectTable: {
    title: "Objects",
    key: "Key",
    size: "Size",
    lastModified: "Last Modified",
  },
  createBucketDialog: {
    trigger: "New bucket",
    title: "Create bucket",
    nameLabel: "Bucket name",
    cancel: "Cancel",
    creating: "Creating…",
    submit: "Create",
    success: "Bucket created successfully.",
  },
  bucketRowActions: {
    actions: "Bucket actions",
    delete: "Delete",
    deleteTitle: "Delete bucket",
    deleteConfirm:
      "Are you sure you want to delete {bucket}? This action cannot be undone.",
  },
  objectRowActions: {
    actions: "Object actions",
    download: "Download",
    rename: "Rename",
    delete: "Delete",
    deleteTitle: "Delete object",
    deleteConfirm:
      "Are you sure you want to delete {key}? This action cannot be undone.",
  },
  renameObjectDialog: {
    title: "Rename object",
    keyLabel: "New key",
    submit: "Rename",
    cancel: "Cancel",
    renaming: "Renaming…",
    success: "Object renamed successfully",
    failed: "Failed to rename object",
    sameKey: "New key must be different from the current key",
    emptyKey: "Key cannot be empty",
    leadingSlash: "Key must not start with a slash",
    tooLong: "Key must not exceed 1024 characters",
  },
  uploadDialog: {
    trigger: "Upload",
    title: "Upload file",
    fileLabel: "File",
    cancel: "Cancel",
    uploading: "Uploading…",
    submit: "Upload",
    selectFile: "Please select a file.",
    failed: "Upload failed.",
    failedNetwork: "Upload failed. Check your connection.",
    success: "Uploaded {key}",
  },
  errors: {
    connectFailed: "Failed to connect to S3",
    connectFailedDetail:
      "Could not reach {endpoint}. Make sure LocalStack is running and AWS_ENDPOINT_URL is configured correctly.",
    retry: "Retry",
  },
} as const;

export default dict;
export type S3Dict = typeof dict;
