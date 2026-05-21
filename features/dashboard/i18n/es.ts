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
  serviceHealthPanel: {
    title: "Estado de Servicios LocalStack",
    services: {
      S3: "S3",
      SQS: "SQS",
      DynamoDB: "DynamoDB",
      Lambda: "Lambda",
      SNS: "SNS",
    },
    status: {
      healthy: "Saludable",
      degraded: "Degradado",
      unreachable: "No disponible",
    },
    hint: "Verificá que LocalStack esté corriendo",
    columns: {
      service: "Servicio",
      status: "Estado",
    },
  },
} as const satisfies DashboardDictTranslated;

export default dict;
