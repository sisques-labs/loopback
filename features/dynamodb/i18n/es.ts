import type { DynamoDBDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type DynamoDBDictTranslated = WidenStringLiterals<DynamoDBDict>;

const dict = {
  page: {
    title: "DynamoDB",
    empty: "No se encontraron tablas.",
    createCta: "Crear tabla",
  },
  table: {
    name: "Nombre",
    status: "Estado",
    itemCount: "Ítems",
    sizeBytes: "Tamaño",
    partitionKey: "Clave de partición",
    sortKey: "Clave de ordenamiento",
    actions: "Acciones",
    view: "Ver",
    delete: "Eliminar",
  },
  createTableDialog: {
    trigger: "Crear tabla",
    title: "Crear tabla DynamoDB",
    description: "Creá una nueva tabla DynamoDB en LocalStack.",
    nameLabel: "Nombre de la tabla",
    namePlaceholder: "mi-tabla",
    nameHint: "3–255 caracteres, letras, números, guiones, guiones bajos, puntos",
    pkNameLabel: "Nombre de la clave de partición",
    pkTypelabel: "Tipo de clave de partición",
    addSortKey: "Agregar clave de ordenamiento",
    skNameLabel: "Nombre de la clave de ordenamiento (opcional)",
    skTypeLabel: "Tipo de clave de ordenamiento",
    cancel: "Cancelar",
    submit: "Crear",
    creating: "Creando…",
    successToast: "Tabla creada exitosamente.",
  },
  createTableValidation: {
    nameRequired: "El nombre de la tabla es obligatorio.",
    nameInvalid:
      "El nombre de la tabla debe tener entre 3 y 255 caracteres y contener solo letras, números, guiones, guiones bajos y puntos.",
    pkNameRequired: "El nombre de la clave de partición es obligatorio.",
    pkTypeInvalid: "Seleccioná un tipo de clave de partición válido.",
    skIncomplete:
      "El tipo de clave de ordenamiento es obligatorio cuando se indica un nombre de clave de ordenamiento.",
  },
  deleteTableDialog: {
    title: "Eliminar tabla",
    description:
      "Esta acción no se puede deshacer. La tabla y todos sus datos serán eliminados.",
    confirm: "Eliminar",
    cancel: "Cancelar",
    successToast: "Tabla eliminada.",
  },
  scan: {
    back: "Volver a las tablas",
    empty: "No se encontraron ítems.",
    viewItem: "Ver",
    putItem: "Insertar ítem",
    deleteItem: "Eliminar",
    prev: "Página anterior",
    next: "Siguiente página",
    page: "Página",
  },
  itemViewDialog: {
    title: "Detalle del ítem",
    close: "Cerrar",
  },
  putItemDialog: {
    trigger: "Insertar ítem",
    title: "Insertar ítem",
    description:
      'Insertá o reemplazá un ítem usando JSON nativo. Ejemplo: {"pk": "valor", "count": 1}',
    jsonLabel: "JSON del ítem",
    jsonHint: "Escribí JSON nativo — no el formato AttributeValue de DynamoDB.",
    jsonPlaceholder: '{"pk": "valor", "sk": "valor-ordenamiento"}',
    cancel: "Cancelar",
    submit: "Insertar ítem",
    saving: "Guardando…",
    successToast: "Ítem guardado.",
    invalidJson: "JSON inválido — debe ser un objeto plano",
    notObject: "El valor debe ser un objeto JSON, no un array ni un primitivo.",
  },
  deleteItemDialog: {
    title: "Eliminar ítem",
    description: "Esta acción no se puede deshacer.",
    confirm: "Eliminar",
    cancel: "Cancelar",
    successToast: "Ítem eliminado.",
  },
  sdkErrors: {
    notFound: "El recurso especificado no existe.",
    resourceInUse: "El recurso está en uso actualmente.",
    resourceNotFound: "La tabla especificada no existe.",
    validation: "Parámetros de solicitud inválidos.",
    conditionalCheckFailed: "No se pudo evaluar una condición especificada en la operación.",
    limitExceeded: "Demasiadas solicitudes. Intentá de nuevo.",
    endpointUnreachable:
      "No se puede conectar a LocalStack en {endpoint}. Asegurate de que esté en ejecución.",
    unknown: "Ocurrió un error inesperado.",
  },
  editItemDialog: {
    trigger: "Editar",
    title: "Editar ítem",
    description: "Editá los atributos no clave de este ítem. Los campos clave están bloqueados.",
    keyFieldsLabel: "Campos clave (bloqueados)",
    jsonLabel: "JSON del ítem",
    jsonHint: "Editá los atributos no clave usando JSON nativo.",
    cancel: "Cancelar",
    submit: "Guardar cambios",
    saving: "Guardando…",
    successToast: "Ítem actualizado.",
    overwriteWarning: "Esto sobreescribirá todos los atributos no clave.",
    invalidJson: "JSON inválido — debe ser un objeto plano",
    notObject: "El valor debe ser un objeto JSON, no un array ni un primitivo.",
  },
  query: {
    modeScan: "Escaneo",
    modeQuery: "Consulta",
    pkLabel: "Valor de clave de partición",
    pkPlaceholder: "ej. usuario-1",
    pkHint: "Ingresá un valor de clave de partición para consultar ítems. La PK es obligatoria.",
    skLabel: "Valor de clave de ordenamiento (opcional)",
    skPlaceholder: "ej. pedido-5",
    search: "Buscar",
    empty: "Ningún ítem coincide con esta consulta.",
    pkRequired: "La clave de partición es obligatoria.",
  },
  tableDetail: {
    partitionKey: "Clave de partición",
    sortKey: "Clave de ordenamiento",
    status: "Estado",
    items: "Ítems",
    size: "Tamaño (bytes)",
    creationDate: "Creada",
    billingMode: "Modo de facturación",
    gsiCount: "Cantidad de GSI",
    noSortKey: "—",
  },
  errors: {
    connectFailed: "No se pudo conectar a DynamoDB",
    connectFailedDetail:
      "No se pudo alcanzar {endpoint}. Asegurate de que LocalStack esté en ejecución y de que AWS_ENDPOINT_URL esté configurado correctamente.",
    tableNotFound: "Tabla no encontrada",
    tableNotFoundDetail:
      "LocalStack no tiene una tabla para esta URL. Puede haberse borrado, reiniciado LocalStack o el enlace estar desactualizado.",
    backToTables: "Volver a las tablas",
    retry: "Reintentar",
  },
} as const satisfies DynamoDBDictTranslated;

export default dict;
