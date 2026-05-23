import type { LogsDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type LogsDictTranslated = WidenStringLiterals<LogsDict>;

const dict = {
  title: "CloudWatch Logs",
  description: "Transmite, filtra y busca entradas de log desde el endpoint de AWS configurado.",
  filters: {
    service: "Servicio",
    level: "Nivel",
    allServices: "Todos los servicios",
    allLevels: "Todos los niveles",
  },
  search: {
    placeholder: "Buscar en logs...",
    label: "Buscar",
  },
  entry: {
    level: {
      info: "INFO",
      warn: "WARN",
      error: "ERROR",
      unknown: "UNKNOWN",
    },
  },
  status: {
    idle: "Sin conexión",
    polling: "En vivo",
    error: "Error de conexión",
  },
  autoScroll: {
    enable: "Auto-desplazamiento",
  },
  empty: "Sin entradas de log",
  noMatch: "Sin resultados para los filtros actuales",
  updatedAt: "Actualizado hace {time}",
  errors: {
    fetchFailed: "Error al obtener logs",
  },
  actions: {
    clearBuffer: "Limpiar logs",
  },
} as const satisfies LogsDictTranslated;

export default dict;
