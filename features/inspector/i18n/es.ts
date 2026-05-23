import type { InspectorDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type InspectorDictTranslated = WidenStringLiterals<InspectorDict>;

const dict = {
  title: "Inspector de Solicitudes AWS",
  description: "Inspecciona cada llamada al SDK de AWS realizada por Server Actions — filtra, busca y repite.",
  toolbar: {
    filters: {
      service: {
        label: "Servicio",
        all: "Todos los servicios",
      },
      status: {
        label: "Estado",
        all: "Todos",
        success: "Éxito",
        error: "Error",
      },
      text: {
        placeholder: "Buscar operación o payload…",
      },
    },
    view: {
      label: "Vista",
      list: "Lista",
      timeline: "Línea de tiempo",
    },
    clearBuffer: "Limpiar",
    statusPolling: "En vivo",
    statusError: "Error",
    statusIdle: "Inactivo",
    lastUpdated: "Actualizado hace {time}",
  },
  empty: {
    title: "Sin solicitudes aún",
    body: "Las llamadas al SDK de AWS realizadas por Server Actions aparecerán aquí.",
  },
  card: {
    duration: "{ms}ms",
    attempts: "{n} intentos",
    retries: "{n} reintentos",
  },
  detail: {
    title: "Detalle de solicitud",
    input: "Entrada",
    output: "Salida",
    attempts: "Intentos",
    duration: "Duración",
    timestamp: "Marca de tiempo",
    error: "Error",
    closeLabel: "Cerrar",
  },
} as const satisfies InspectorDictTranslated;

export default dict;
