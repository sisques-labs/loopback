const dict = {
  header: {
    endpoint: "Endpoint",
    endpointNotSet: "AWS_ENDPOINT_URL not set",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
  },
  sidebar: {
    services: "Services",
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
