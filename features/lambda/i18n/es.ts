import type { LambdaDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type LambdaDictTranslated = WidenStringLiterals<LambdaDict>;

const dict = {
  page: {
    title: "Funciones Lambda",
    empty: "No hay funciones desplegadas en esta cuenta.",
  },
  table: {
    functionName: "Nombre de la función",
    runtime: "Runtime",
    handler: "Handler",
    description: "Descripción",
    timeout: "Timeout (ms)",
    memorySize: "Memoria (MB)",
    state: "Estado",
    stateActive: "Activa",
    statePending: "Pendiente",
    stateFailed: "Con error",
    stateInactive: "Inactiva",
    stateUnknown: "Desconocido",
  },
  rowActions: {
    actions: "Acciones de la función",
    viewDetail: "Ver detalle",
    invoke: "Invocar",
  },
  invokeDialog: {
    title: "Invocar {functionName}",
    payloadLabel: "Payload (JSON)",
    payloadPlaceholder: "Dejá vacío o ingresá un objeto JSON válido…",
    cancel: "Cancelar",
    submit: "Invocar",
    invoking: "Invocando…",
    responseTitle: "Respuesta",
    statusCodeLabel: "Código de estado",
    bodyLabel: "Cuerpo",
    functionErrorTitle: "Error de la función",
    functionErrorDetail: "La función devolvió un error: {functionError}",
    invalidPayload: "El payload debe ser JSON válido.",
  },
  detail: {
    back: "Volver a las funciones",
    functionNameLabel: "Nombre de la función",
    functionArnLabel: "ARN",
    runtimeLabel: "Runtime",
    handlerLabel: "Handler",
    descriptionLabel: "Descripción",
    timeoutLabel: "Timeout (ms)",
    memorySizeLabel: "Memoria (MB)",
    lastModifiedLabel: "Última modificación",
    stateLabel: "Estado",
  },
  sdkErrors: {
    notFound: "La función especificada no existe.",
    invalidParam: "Parámetro de función inválido.",
    tooManyRequests: "Demasiadas solicitudes. Intentá de nuevo.",
    serviceError: "Error del servicio Lambda.",
    payloadTooLarge: "El payload es demasiado grande.",
    endpointUnreachable: "No se puede conectar a LocalStack en {endpoint}. Asegurate de que esté en ejecución.",
    unknown: "Ocurrió un error inesperado.",
  },
  errors: {
    connectFailed: "No se pudo conectar a Lambda",
    connectFailedDetail:
      "No se pudo alcanzar {endpoint}. Asegurate de que LocalStack esté en ejecución y de que AWS_ENDPOINT_URL esté configurado correctamente.",
    connectFailedDetailGeneric:
      "No se pudo alcanzar LocalStack desde el servidor de la app. Comprueba que esté en marcha, que AWS_ENDPOINT_URL sea correcto y define NEXT_PUBLIC_AWS_ENDPOINT_URL con la misma URL (necesario para mensajes en el cliente si usas una IP de red local).",
    functionNotFound: "Función no encontrada",
    functionNotFoundDetail:
      "LocalStack no tiene una función para esta URL. Puede haberse borrado, reiniciado LocalStack o el enlace estar desactualizado.",
    backToFunctions: "Volver a las funciones",
    retry: "Reintentar",
  },
} as const satisfies LambdaDictTranslated;

export default dict;
