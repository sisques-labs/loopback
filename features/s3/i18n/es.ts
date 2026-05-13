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
    delete: "Eliminar",
    deleteTitle: "Eliminar objeto",
    deleteConfirm:
      "¿Seguro que quieres eliminar {key}? Esta acción no se puede deshacer.",
  },
  uploadDialog: {
    trigger: "Subir",
    title: "Subir archivo",
    fileLabel: "Archivo",
    cancel: "Cancelar",
    uploading: "Subiendo…",
    submit: "Subir",
    selectFile: "Selecciona un archivo.",
    failed: "Error al subir.",
    failedNetwork: "Error al subir. Comprueba tu conexión.",
    success: "Subido {key}",
  },
  errors: {
    connectFailed: "No se pudo conectar a S3",
    connectFailedDetail:
      "No se pudo alcanzar {endpoint}. Asegúrate de que LocalStack esté en ejecución y de que AWS_ENDPOINT_URL esté configurado correctamente.",
    retry: "Reintentar",
  },
} as const satisfies S3DictTranslated;

export default dict;
