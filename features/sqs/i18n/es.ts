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
  createQueueDialog: {
    trigger: "Nueva cola",
    title: "Crear cola",
    nameLabel: "Nombre de la cola",
    cancel: "Cancelar",
    creating: "Creando…",
    submit: "Crear",
    success: "Cola creada correctamente.",
    fifoLabel: "Cola FIFO",
    fifoHint: "Si hace falta, se agrega el sufijo .fifo automáticamente.",
    namePlaceholder: "mi-cola",
    nameFifoPlaceholder: "mi-cola (pasa a ser mi-cola.fifo)",
  },
  createQueueValidation: {
    required: "El nombre de la cola es obligatorio.",
    standardCannotEndFifo:
      "Las colas estándar no pueden terminar en .fifo. Desmarcá FIFO o usá una cola FIFO.",
    nameTooLong:
      "El nombre debe tener como máximo 80 caracteres (incluido .fifo en colas FIFO).",
    fifoMustEndFifo: "Los nombres de cola FIFO deben terminar en .fifo.",
    fifoInvalidPrefix:
      "Solo letras, números, guiones y guiones bajos antes de .fifo.",
    standardInvalidPattern:
      "El nombre debe tener 1–80 caracteres: letras, números, guiones o guiones bajos.",
  },
  queueRowActions: {
    actions: "Acciones de la cola",
    delete: "Eliminar",
    deleteTitle: "Eliminar cola",
    deleteConfirm:
      "¿Seguro que querés eliminar {queue}? Los mensajes de la cola se perderán. Esta acción no se puede deshacer.",
    viewDetail: "Ver detalle",
  },
  queueDetail: {
    back: "Volver a las colas",
    urlLabel: "URL de la cola",
    attributesTitle: "Atributos de la cola",
    messagingTitle: "Mensajes",
    typeStandard: "Estándar",
    typeFifo: "FIFO",
    sendMessage: {
      trigger: "Enviar mensaje",
      title: "Enviar mensaje a {queue}",
      bodyLabel: "Cuerpo del mensaje",
      bodyPlaceholder: "Texto plano o JSON…",
      cancel: "Cancelar",
      submitting: "Enviando…",
      submit: "Enviar",
      successToast: "Mensaje enviado a {queue}.",
      invalidJson: "JSON con sintaxis inválida.",
      formatButton: "Formatear JSON",
    },
    receive: {
      trigger: "Recibir mensajes",
      title: "Recibir mensajes",
      description:
        "Obtiene hasta 5 mensajes con hasta 2 segundos de espera larga. No se borran mensajes de la cola; el tiempo de visibilidad puede ocultarlos temporalmente.",
      empty: "No hubo mensajes (cola vacía o mensajes en vuelo).",
      messageIdLabel: "ID de mensaje",
      submitting: "Recibiendo…",
      requeue: {
        requeue: "Reencolar",
        requeueing: "Reencolando…",
        requeueSuccess: "Mensaje reencolado.",
      },
    },
    purge: {
      trigger: "Vaciar cola",
      title: "Vaciar mensajes de la cola",
      description:
        "Vaciar elimina todos los mensajes de {queue}. La cola sigue existiendo: no es lo mismo que eliminar la cola. No se puede deshacer.",
      confirmLabel: "Vaciar mensajes",
    },
  },
  validation: {
    queueUrlRequired: "La URL de la cola es obligatoria.",
    receiptHandleRequired: "El receipt handle es obligatorio.",
    messageRequired: "El cuerpo del mensaje no puede estar vacío.",
  },
  sdkErrors: {
    invalidParam: "Parámetro de cola inválido.",
    notFound: "La cola especificada no existe.",
    limitExceeded: "Se alcanzó el límite de colas para esta cuenta.",
    notAuthorized: "Sin autorización para realizar esta acción en SQS.",
    endpointUnreachable: "No se puede conectar a LocalStack en {endpoint}. Asegurate de que esté en ejecución.",
    unknown: "Ocurrió un error inesperado.",
    receiptHandleInvalid:
      "La ventana de visibilidad de este mensaje expiró — recibí un nuevo lote para reintentar.",
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
