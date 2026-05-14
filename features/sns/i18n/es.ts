import type { SNSDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type SNSDictTranslated = WidenStringLiterals<SNSDict>;

const dict = {
  page: {
    title: "Topics de SNS",
    empty: "No hay topics en esta cuenta.",
  },
  topicTable: {
    name: "Nombre",
    displayName: "Nombre de visualización",
    arn: "ARN",
    type: "Tipo",
    typeFifo: "FIFO",
    typeStandard: "Estándar",
  },
  createTopicDialog: {
    trigger: "Nuevo topic",
    title: "Crear topic",
    nameLabel: "Nombre del topic",
    cancel: "Cancelar",
    creating: "Creando…",
    submit: "Crear",
    success: "Topic creado correctamente.",
    fifoLabel: "Cola FIFO",
    fifoHint: "El nombre tendrá el sufijo .fifo automáticamente",
    nameFifoSuffix: ".fifo",
    nameFifoPlaceholder: "mi-topic (se agregará el sufijo mi-topic.fifo)",
  },
  topicRowActions: {
    actions: "Acciones del topic",
    delete: "Eliminar",
    deleteTitle: "Eliminar topic",
    deleteConfirm:
      "¿Seguro que querés eliminar {topic}? Esta acción no se puede deshacer.",
  },
  errors: {
    connectFailed: "No se pudo conectar a SNS",
    connectFailedDetail:
      "No se pudo alcanzar {endpoint}. Asegurate de que LocalStack esté en ejecución y de que AWS_ENDPOINT_URL esté configurado correctamente.",
    retry: "Reintentar",
  },
} as const satisfies SNSDictTranslated;

export default dict;
