import type { SQSDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type SQSDictTranslated = WidenStringLiterals<SQSDict>;

const dict = {
  page: {
    title: "Colas SQS",
    empty: "No hay colas en esta cuenta.",
  },
  queueTable: {
    name: "Nombre",
    url: "URL de la cola",
    type: "Tipo",
    typeFifo: "FIFO",
    typeStandard: "Estándar",
  },
  queueDetailStub: {
    title: "Cola",
    description:
      "Los atributos completos de la cola y las herramientas de mensajería llegarán en una actualización posterior. Podés guardar esta URL en favoritos.",
    urlLabel: "URL de la cola",
    back: "Volver a las colas",
  },
  errors: {
    connectFailed: "No se pudo conectar a SQS",
    connectFailedDetail:
      "No se pudo alcanzar {endpoint}. Asegurate de que LocalStack esté en ejecución y de que AWS_ENDPOINT_URL esté configurado correctamente.",
    connectFailedDetailGeneric:
      "No se pudo alcanzar LocalStack desde el servidor de la app. Comprueba que esté en marcha, que AWS_ENDPOINT_URL sea correcto y define NEXT_PUBLIC_AWS_ENDPOINT_URL con la misma URL (necesario para mensajes en el cliente si usas una IP de red local).",
    queueNotFound: "Cola no encontrada",
    queueNotFoundDetail:
      "LocalStack no tiene una cola para esta URL. Puede haberse borrado, reiniciado LocalStack o el enlace estar desactualizado.",
    backToQueues: "Volver a SQS",
    retry: "Reintentar",
  },
} as const satisfies SQSDictTranslated;

export default dict;
