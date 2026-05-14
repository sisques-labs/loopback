const dict = {
  page: {
    title: "Lambda Functions",
    empty: "No functions deployed in this account.",
  },
  table: {
    functionName: "Function Name",
    runtime: "Runtime",
    handler: "Handler",
    description: "Description",
    timeout: "Timeout (ms)",
    memorySize: "Memory (MB)",
    state: "State",
    stateActive: "Active",
    statePending: "Pending",
    stateFailed: "Failed",
    stateInactive: "Inactive",
    stateUnknown: "Unknown",
  },
  rowActions: {
    actions: "Function actions",
    viewDetail: "View detail",
    invoke: "Invoke",
  },
  invokeDialog: {
    title: "Invoke {functionName}",
    payloadLabel: "Payload (JSON)",
    payloadPlaceholder: "Leave empty or enter a valid JSON object…",
    cancel: "Cancel",
    submit: "Invoke",
    invoking: "Invoking…",
    responseTitle: "Response",
    statusCodeLabel: "Status code",
    bodyLabel: "Body",
    functionErrorTitle: "Function error",
    functionErrorDetail: "The function returned an error: {functionError}",
    invalidPayload: "Payload must be valid JSON.",
  },
  detail: {
    back: "Back to functions",
    functionNameLabel: "Function name",
    functionArnLabel: "ARN",
    runtimeLabel: "Runtime",
    handlerLabel: "Handler",
    descriptionLabel: "Description",
    timeoutLabel: "Timeout (ms)",
    memorySizeLabel: "Memory (MB)",
    lastModifiedLabel: "Last modified",
    stateLabel: "State",
  },
  sdkErrors: {
    notFound: "The specified function does not exist.",
    invalidParam: "Invalid function parameter.",
    tooManyRequests: "Too many requests. Please try again.",
    serviceError: "Lambda service error.",
    payloadTooLarge: "Payload is too large.",
    endpointUnreachable: "Cannot connect to LocalStack at {endpoint}. Make sure it is running.",
    unknown: "An unexpected error occurred.",
  },
  errors: {
    connectFailed: "Failed to connect to Lambda",
    connectFailedDetail:
      "Could not reach {endpoint}. Make sure LocalStack is running and AWS_ENDPOINT_URL is configured correctly.",
    connectFailedDetailGeneric:
      "Could not reach LocalStack from the app server. Ensure it is running, AWS_ENDPOINT_URL is correct, and set NEXT_PUBLIC_AWS_ENDPOINT_URL to the same URL (required for client-side hints when using a LAN IP).",
    functionNotFound: "Function not found",
    functionNotFoundDetail:
      "LocalStack has no function for this URL. It may have been deleted, LocalStack was reset, or the link is outdated.",
    backToFunctions: "Back to functions",
    retry: "Retry",
  },
} as const;

export default dict;
export type LambdaDict = typeof dict;
