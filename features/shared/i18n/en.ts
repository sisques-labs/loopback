const dict = {
  header: {
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
  },
  sidebar: {
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
