import type { TimelineDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type TimelineDictTranslated = WidenStringLiterals<TimelineDict>;

const dict = {
  title: "Línea de tiempo",
  description: "Registro visual de eventos en tiempo real para todos los servicios de LocalStack.",
  loading: "Cargando eventos...",
  timeRange: {
    label: "Rango de tiempo",
    "1h": "Última hora",
    "6h": "Últimas 6 horas",
    "24h": "Últimas 24 horas",
    all: "Todo el tiempo",
  },
  toolbar: {
    timeRange: {
      label: "Rango de tiempo",
      "1h": "Última hora",
      "6h": "Últimas 6 horas",
      "24h": "Últimas 24 horas",
      all: "Todo el tiempo",
    },
    statusPolling: "Sondeando",
    statusError: "Error",
    statusIdle: "Inactivo",
    lastUpdated: "Actualizado hace {time}",
  },
  empty: {
    title: "No se encontraron eventos",
    body: "No se encontraron eventos para el rango de tiempo seleccionado. Asegúrate de que LocalStack esté corriendo y los servicios estén siendo invocados.",
  },
} as const satisfies TimelineDictTranslated;

export default dict;
