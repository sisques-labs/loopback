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
    namePlaceholder: "mi-topic",
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
    invalidJson: "El mensaje debe ser JSON válido.",
    tooLarge: "El mensaje supera el límite de 256 KB.",
  },
  validation: {
    topicNameRequired: "El nombre del topic es obligatorio.",
    topicNameInvalid: "El nombre debe tener entre 1 y 256 caracteres: letras, números, guiones o guiones bajos.",
    topicArnRequired: "El ARN del topic es obligatorio.",
    messageRequired: "El mensaje no puede estar vacío.",
    protocolRequired: "El protocolo es obligatorio.",
    endpointRequired: "El endpoint es obligatorio.",
    fifoSqsOnly: "Los topics FIFO solo admiten suscripciones SQS.",
    pendingUnsubscribe: "No se puede desuscribir una suscripción pendiente.",
  },
  sdkErrors: {
    notFound: "El topic especificado no existe.",
    invalidParam: "Parámetro de topic inválido.",
    limitExceeded: "Se alcanzó el límite de topics para esta cuenta.",
    kmsError: "La clave KMS asociada a este topic no está accesible.",
    notAuthorized: "Sin autorización para realizar esta acción en SNS.",
    endpointUnreachable: "No se puede conectar a LocalStack en {endpoint}. Asegurate de que esté en ejecución.",
    unknown: "Ocurrió un error inesperado.",
  },
  errors: {
    connectFailed: "No se pudo conectar a SNS",
    connectFailedDetail:
      "No se pudo alcanzar {endpoint}. Asegurate de que LocalStack esté en ejecución y de que AWS_ENDPOINT_URL esté configurado correctamente.",
    connectFailedDetailGeneric:
      "No se pudo alcanzar LocalStack desde el servidor de la app. Comprueba que esté en marcha, que AWS_ENDPOINT_URL sea correcto y define NEXT_PUBLIC_AWS_ENDPOINT_URL con la misma URL (necesario para mensajes en el cliente si usas una IP de red local).",
    topicNotFound: "Topic no encontrado",
    topicNotFoundDetail:
      "LocalStack no tiene un topic para esta URL. Puede haberse borrado, reiniciado LocalStack o el enlace estar desactualizado.",
    backToTopics: "Volver a SNS",
    retry: "Reintentar",
  },
} as const satisfies SNSDictTranslated;

export default dict;
