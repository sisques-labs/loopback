import type { S3Dict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type S3DictTranslated = WidenStringLiterals<S3Dict>;

const dict = {
  page: {
    title: "Buckets de S3",
    empty: "No hay buckets en esta cuenta.",
  },
  bucketDetail: {
    empty: "Este bucket está vacío.",
  },
  bucketTable: {
    name: "Nombre",
    created: "Creado",
  },
  objectTable: {
    title: "Objetos",
    key: "Clave",
    size: "Tamaño",
    lastModified: "Última modificación",
  },
  createBucketDialog: {
    trigger: "Nuevo bucket",
    title: "Crear bucket",
    nameLabel: "Nombre del bucket",
    namePlaceholder: "mi-bucket",
    cancel: "Cancelar",
    creating: "Creando…",
    submit: "Crear",
    success: "Bucket creado correctamente.",
  },
  bucketRowActions: {
    actions: "Acciones del bucket",
    delete: "Eliminar",
    deleteTitle: "Eliminar bucket",
    deleteConfirm:
      "¿Seguro que quieres eliminar {bucket}? Esta acción no se puede deshacer.",
  },
  objectRowActions: {
    actions: "Acciones del objeto",
    download: "Descargar",
    rename: "Renombrar",
    delete: "Eliminar",
    deleteTitle: "Eliminar objeto",
    deleteConfirm:
      "¿Seguro que quieres eliminar {key}? Esta acción no se puede deshacer.",
  },
  renameObjectDialog: {
    title: "Renombrar objeto",
    keyLabel: "Nueva clave",
    submit: "Renombrar",
    cancel: "Cancelar",
    renaming: "Renombrando…",
    success: "Objeto renombrado correctamente.",
    failed: "No se pudo renombrar el objeto",
    sameKey: "La nueva clave debe ser distinta a la actual",
    emptyKey: "La clave no puede estar vacía",
    leadingSlash: "La clave no debe comenzar con una barra",
    tooLong: "La clave no puede superar los 1024 caracteres",
  },
  uploadDialog: {
    trigger: "Subir",
    title: "Subir archivo",
    fileLabel: "Archivo",
    selectMultiple: "Archivos",
    cancel: "Cancelar",
    uploading: "Subiendo…",
    submit: "Subir",
    selectFile: "Selecciona un archivo.",
    failed: "Error al subir.",
    failedNetwork: "Error al subir. Comprueba tu conexión.",
    success: "Subido {key}",
    dropHere: "Suelta los archivos para subir",
    uploadingCount: "Subiendo {count} archivos…",
    duplicateWarning: "Nombres de archivo duplicados. Renómbralos y reintenta.",
    batchSummary: "{ok} subidos, {failed} con error",
    successFile: "{name} subido",
    errorFile: "{name} no se pudo subir",
  },
  uploadProgress: {
    title: "Subidas",
    minimize: "Minimizar",
    expand: "Ver subidas",
    dismiss: "Descartar",
    finalizing: "Finalizando…",
    uploading: "Subiendo",
    completed: "Completado",
    failed: "Falló",
    clearCompleted: "Limpiar completados",
    ariaLiveLabel: "Progreso de subidas",
    fileCount: "{count} archivo(s)",
  },
  errors: {
    connectFailed: "No se pudo conectar a S3",
    connectFailedDetail:
      "No se pudo alcanzar {endpoint}. Asegúrate de que LocalStack esté en ejecución y de que AWS_ENDPOINT_URL esté configurado correctamente.",
    retry: "Reintentar",
  },
} as const satisfies S3DictTranslated;

export default dict;
