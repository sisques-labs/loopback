import type { SharedDict } from "./en";
import type { WidenStringLiterals } from "./widen-literals";

type SharedDictTranslated = WidenStringLiterals<SharedDict>;

const dict = {
  header: {
    endpoint: "Endpoint",
    endpointNotSet: "AWS_ENDPOINT_URL no está configurado",
    openMenu: "Abrir menú de navegación",
    closeMenu: "Cerrar menú de navegación",
  },
  sidebar: {
    services: "Servicios",
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
