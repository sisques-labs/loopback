import type { SeedDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type SeedDictTranslated = WidenStringLiterals<SeedDict>;

const dict = {
  page: {
    title: "Datos de demo",
    description: "Cargá recursos predefinidos en tu entorno de LocalStack o reiniciá todo.",
  },
  presets: {
    sectionTitle: "Elegí un preset",
    ecommerce: {
      name: "E-commerce",
      description: "Buckets S3, colas SQS, tablas DynamoDB, funciones Lambda y topics SNS para una plataforma de e-commerce.",
    },
    blog: {
      name: "Blog",
      description: "Bucket de assets, cola de comentarios, tablas de posts y autores, función publicadora y topic de actualizaciones.",
    },
    eventDriven: {
      name: "Orientado a eventos",
      description: "Colas de ingesta y DLQ, tabla de eventos, funciones consumidora y enrutadora, topics de fanout y alertas.",
    },
  },
  load: {
    button: "Cargar preset",
    loading: "Cargando…",
    noPresetSelected: "Seleccioná un preset para continuar",
    successTitle: "Preset cargado",
    errorTitle: "Error al cargar",
  },
  results: {
    tableTitle: "Resultados",
    service: "Servicio",
    created: "Creados",
    skipped: "Omitidos",
    failed: "Fallidos",
  },
  reset: {
    sectionTitle: "Reiniciar entorno",
    sectionDescription: "Previsualiza lo que se eliminará antes de confirmar.",
    previewButton: "Previsualizar reinicio",
    previewing: "Previsualizando…",
    confirmButton: "Confirmar reinicio",
    confirming: "Reiniciando…",
    previewTitle: "Recursos a eliminar",
    successTitle: "Entorno reiniciado",
    errorTitle: "Error al reiniciar",
    noResources: "No se encontraron recursos.",
  },
  confirmDialog: {
    title: "Reiniciar entorno",
    description: "Esto eliminará permanentemente TODOS los recursos listados arriba. Esta acción no se puede deshacer.",
    cancel: "Cancelar",
    confirm: "Confirmar reinicio",
  },
} as const satisfies SeedDictTranslated;

export default dict;
