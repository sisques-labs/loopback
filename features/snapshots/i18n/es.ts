import type { SnapshotsDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type SnapshotsDictTranslated = WidenStringLiterals<SnapshotsDict>;

const dict = {
  page: {
    title: "Snapshots",
    description: "Captura, exporta, importa y restaura tu entorno de LocalStack.",
  },
  create: {
    sectionTitle: "Crear Snapshot",
    button: "Crear snapshot",
    creating: "Capturando…",
    successTitle: "Snapshot creado",
    errorTitle: "Error al capturar",
    itemGuardWarn: "La tabla {{table}} tiene {{count}} ítems — esto puede ser lento.",
    itemGuardReject: "La tabla {{table}} supera el límite de 50K ítems y fue omitida.",
    partialSuccess: "Snapshot creado con {{count}} servicio(s) no disponible(s).",
  },
  importExport: {
    sectionTitle: "Importar / Exportar",
    exportButton: "Exportar snapshot",
    importButton: "Importar snapshot",
    importing: "Importando…",
    importSuccess: "Snapshot importado",
    importError: "Archivo de snapshot inválido",
    fileTooLarge: "Archivo muy grande (máx. 50 MB)",
    noSnapshot: "No hay snapshot cargado",
  },
  restore: {
    sectionTitle: "Restaurar",
    button: "Restaurar snapshot",
    restoring: "Restaurando…",
    successTitle: "Restauración completa",
    errorTitle: "Error al restaurar",
    noSnapshot: "No hay snapshot para restaurar. Crea o importa uno primero.",
    snapshotInfo:
      "Snapshot del {{date}} — {{tables}} tablas, {{queues}} colas, {{buckets}} buckets",
  },
  results: {
    service: "Servicio",
    resource: "Recurso",
    status: "Estado",
    statusCreated: "Creado",
    statusSkipped: "Omitido",
    statusFailed: "Fallido",
  },
} as const satisfies SnapshotsDictTranslated;

export default dict;
