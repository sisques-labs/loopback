import type { DashboardDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type DashboardDictTranslated = WidenStringLiterals<DashboardDict>;

const dict = {
  page: {
    title: "Panel",
    subtitle: "Tu entorno AWS local",
  },
  connection: {
    title: "Conexión",
    connected: "Conectado",
    unreachable: "No disponible",
    degraded: "Degradado",
  },
  errors: {
    connectFailed: "Fallo de conexión",
    connectFailedDetail: "No se pudo conectar al endpoint en {endpoint}.",
    retry: "Reintentar",
  },
  services: {
    comingSoon: "Próximamente",
  },
} as const satisfies DashboardDictTranslated;

export default dict;
