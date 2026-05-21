const dict = {
  page: {
    title: "Snapshots",
    description: "Capture, export, import, and restore your LocalStack environment.",
  },
  create: {
    sectionTitle: "Create Snapshot",
    button: "Create snapshot",
    creating: "Capturing…",
    successTitle: "Snapshot created",
    errorTitle: "Capture failed",
    itemGuardWarn: "Table {{table}} has {{count}} items — this may be slow.",
    itemGuardReject: "Table {{table}} exceeds 50K item limit and was skipped.",
    partialSuccess: "Snapshot created with {{count}} service(s) unavailable.",
  },
  importExport: {
    sectionTitle: "Import / Export",
    exportButton: "Export snapshot",
    importButton: "Import snapshot",
    importing: "Importing…",
    importSuccess: "Snapshot imported",
    importError: "Invalid snapshot file",
    fileTooLarge: "File too large (max 50 MB)",
    noSnapshot: "No snapshot loaded",
  },
  restore: {
    sectionTitle: "Restore",
    button: "Restore snapshot",
    restoring: "Restoring…",
    successTitle: "Restore complete",
    errorTitle: "Restore failed",
    noSnapshot: "No snapshot to restore. Create or import one first.",
    snapshotInfo:
      "Snapshot from {{date}} — {{tables}} tables, {{queues}} queues, {{buckets}} buckets",
  },
  results: {
    service: "Service",
    resource: "Resource",
    status: "Status",
    statusCreated: "Created",
    statusSkipped: "Skipped",
    statusFailed: "Failed",
  },
} as const;

export default dict;
export type SnapshotsDict = typeof dict;
