import type { SharedDict } from "./en";
import type { WidenStringLiterals } from "./widen-literals";

type SharedDictTranslated = WidenStringLiterals<SharedDict>;

const dict = {
  header: {
    openMenu: "Abrir menú de navegación",
    closeMenu: "Cerrar menú de navegación",
  },
  sidebar: {
    dashboard: "Panel",
    services: "Servicios",
    settingsSection: "Configuración",
    settings: "Ajustes",
    tools: "Herramientas",
  },
  settings: {
    title: "Ajustes",
    languageTitle: "Idioma",
    endpointTitle: "Endpoint",
    notSet: "Sin definir",
    endpointSectionTitle: "Endpoint",
    endpointInputLabel: "URL de endpoint personalizado",
    endpointInputPlaceholder: "http://localhost:4566",
    endpointSave: "Guardar",
    endpointClear: "Limpiar override",
    endpointSaving: "Guardando…",
    endpointSuccess: "Endpoint guardado",
    endpointInvalidUrl: "Debe ser una URL absoluta válida",
    envVarsTitle: "Variables de entorno",
    envVarsEndpointLabel: "AWS_ENDPOINT_URL",
    envVarsRegionLabel: "AWS_REGION",
    envVarsAccessKeyLabel: "AWS_ACCESS_KEY_ID",
    envVarsProfileLabel: "AWS_PROFILE",
    envVarsDefault: "(predeterminado)",
    credentialsTitle: "Credenciales",
    credentialsAccessKeyLabel: "ID de clave de acceso",
    credentialsSecretKeyLabel: "Clave de acceso secreta",
    profileTitle: "Fuente de credenciales activa",
    credentialSourceEnv: "Variables de entorno",
    credentialSourceProfile: "Perfil de AWS",
    credentialSourceInstanceMetadata: "Metadatos de instancia",
    credentialSourceFallback: "Alternativa (test/test)",
    profileActiveLabel: "Perfil",
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
