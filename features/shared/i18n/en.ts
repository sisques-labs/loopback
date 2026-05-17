const dict = {
  header: {
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
  },
  sidebar: {
    dashboard: "Dashboard",
    services: "Services",
    settingsSection: "Configuration",
    settings: "Settings",
    tools: "Tools",
  },
  settings: {
    title: "Settings",
    languageTitle: "Language",
    endpointTitle: "Endpoint",
    notSet: "Not set",
    endpointSectionTitle: "Endpoint",
    endpointInputLabel: "Custom endpoint URL",
    endpointInputPlaceholder: "http://localhost:4566",
    endpointSave: "Save",
    endpointClear: "Clear override",
    endpointSaving: "Saving…",
    endpointSuccess: "Endpoint saved",
    endpointInvalidUrl: "Must be a valid absolute URL",
    envVarsTitle: "Environment Variables",
    envVarsEndpointLabel: "AWS_ENDPOINT_URL",
    envVarsRegionLabel: "AWS_REGION",
    envVarsAccessKeyLabel: "AWS_ACCESS_KEY_ID",
    envVarsProfileLabel: "AWS_PROFILE",
    envVarsDefault: "(default)",
    credentialsTitle: "Credentials",
    credentialsAccessKeyLabel: "Access Key ID",
    credentialsSecretKeyLabel: "Secret Access Key",
    profileTitle: "Active Credential Source",
    credentialSourceEnv: "Environment variables",
    credentialSourceProfile: "AWS profile",
    credentialSourceInstanceMetadata: "Instance metadata",
    credentialSourceFallback: "Fallback (test/test)",
    profileActiveLabel: "Profile",
  },
  dialog: {
    close: "Close",
  },
  confirmDialog: {
    cancel: "Cancel",
    confirm: "Confirm",
    confirming: "{confirmLabel}…",
  },
  localeSwitcher: {
    label: "Language",
    en: "English",
    es: "Español",
  },
} as const;

export default dict;
export type SharedDict = typeof dict;
