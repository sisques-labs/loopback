import type { SharedDict } from "./en";
import type { WidenStringLiterals } from "./widen-literals";

type SharedDictTranslated = WidenStringLiterals<SharedDict>;

const dict = {
  header: {
    openMenu: "Abrir menú de navegación",
    closeMenu: "Cerrar menú de navegación",
  },
  sidebar: {
    services: "Servicios",
    settingsSection: "Configuración",
    settings: "Ajustes",
    tools: "Herramientas",
  },
  terminal: {
    title: "Terminal",
  },
  settings: {
    title: "Ajustes",
    languageTitle: "Idioma",
    endpointTitle: "Endpoint",
    notSet: "Sin definir",
  },
  dialog: {
    close: "Cerrar",
  },
  confirmDialog: {
    cancel: "Cancelar",
    confirm: "Confirmar",
    confirming: "{confirmLabel}…",
  },
  localeSwitcher: {
    label: "Idioma",
    en: "English",
    es: "Español",
  },
} as const satisfies SharedDictTranslated;

export default dict;
