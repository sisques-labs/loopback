const dict = {
  page: {
    title: "Demo Data",
    description: "Load preset resources into your LocalStack environment or reset everything.",
  },
  presets: {
    sectionTitle: "Choose a preset",
    ecommerce: {
      name: "E-commerce",
      description: "S3 buckets, SQS queues, DynamoDB tables, Lambda functions, and SNS topics for an e-commerce platform.",
    },
    blog: {
      name: "Blog",
      description: "Assets bucket, comments queue, posts and authors tables, publisher function, and updates topic.",
    },
    eventDriven: {
      name: "Event-Driven",
      description: "Ingestion and DLQ queues, event store table, consumer and router functions, fanout and alerts topics.",
    },
  },
  load: {
    button: "Load preset",
    loading: "Loading…",
    noPresetSelected: "Select a preset to continue",
    successTitle: "Preset loaded",
    errorTitle: "Load failed",
  },
  results: {
    tableTitle: "Results",
    service: "Service",
    created: "Created",
    skipped: "Skipped",
    failed: "Failed",
  },
  reset: {
    sectionTitle: "Reset environment",
    sectionDescription: "Preview what will be deleted before confirming.",
    previewButton: "Preview reset",
    previewing: "Previewing…",
    confirmButton: "Confirm reset",
    confirming: "Resetting…",
    previewTitle: "Resources to delete",
    successTitle: "Environment reset",
    errorTitle: "Reset failed",
    noResources: "No resources found.",
  },
  confirmDialog: {
    title: "Reset environment",
    description: "This will permanently delete ALL resources listed above. This action cannot be undone.",
    cancel: "Cancel",
    confirm: "Confirm reset",
  },
} as const;

export default dict;
export type SeedDict = typeof dict;
