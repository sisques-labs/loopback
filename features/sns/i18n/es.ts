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
    nameFifoPlaceholder: "mi-topic (se agregará el sufijo mi-topic.fifo)",
  },
  topicRowActions: {
    actions: "Acciones del topic",
    delete: "Eliminar",
    deleteTitle: "Eliminar topic",
    deleteConfirm:
      "¿Seguro que querés eliminar {topic}? Esta acción no se puede deshacer.",
    viewDetail: "Ver detalle",
    publish: "Publicar mensaje",
  },
  topicDetail: {
    title: "Detalle del topic",
    arnLabel: "ARN",
    typeLabel: "Tipo",
    typeStandard: "Estándar",
    typeFifo: "FIFO",
    subscriptionsConfirmed: "Suscripciones confirmadas",
    subscriptionsPending: "Suscripciones pendientes",
    back: "Volver a los topics",
    empty: "No se encontraron suscripciones",
  },
  subscriptionTable: {
    protocol: "Protocolo",
    endpoint: "Endpoint",
    status: "Estado",
    statusConfirmed: "Confirmado",
    statusPending: "Pendiente",
    unsubscribe: "Desuscribir",
    unsubscribeTitle: "Desuscribir",
    unsubscribeConfirm: "¿Desuscribir {endpoint} de {topic}?",
  },
  subscribeDialog: {
    trigger: "Suscribir",
    title: "Suscribir endpoint",
    protocolLabel: "Protocolo",
    endpointLabel: "Endpoint",
    endpointPlaceholder: "ej. https://ejemplo.com/webhook",
    cancel: "Cancelar",
    submit: "Suscribir",
    submitting: "Suscribiendo…",
    fifoHint: "Los topics FIFO solo admiten suscripciones SQS.",
  },
  publishDialog: {
    trigger: "Publicar",
    title: "Publicar mensaje en {topic}",
    messageLabel: "Mensaje",
    messagePlaceholder: "Cuerpo del mensaje…",
    subjectLabel: "Asunto (opcional)",
    cancel: "Cancelar",
    submit: "Publicar",
    submitting: "Publicando…",
    successToast: "Mensaje publicado en {topic}.",
  },
  errors: {
    connectFailed: "No se pudo conectar a SNS",
    connectFailedDetail:
      "No se pudo alcanzar {endpoint}. Asegurate de que LocalStack esté en ejecución y de que AWS_ENDPOINT_URL esté configurado correctamente.",
    retry: "Reintentar",
  },
} as const satisfies SNSDictTranslated;

export default dict;
