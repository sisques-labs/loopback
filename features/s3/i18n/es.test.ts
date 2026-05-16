import { describe, expect, it } from "vitest";
import es from "./es";

describe("S3 Spanish copy", () => {
  it("ends rename success with a terminal period", () => {
    expect(es.renameObjectDialog.success.endsWith(".")).toBe(true);
  });

  it("provides a localized create-bucket name placeholder", () => {
    expect(es.createBucketDialog.namePlaceholder).toBe("mi-bucket");
  });

  it("has objectRowActions.preview key", () => {
    expect(es.objectRowActions.preview).toBe("Vista previa");
  });

  it("has previewDialog shape matching en.ts structure", () => {
    expect(es.previewDialog).toBeDefined();
    expect(es.previewDialog.title).toBe("Vista previa");
    expect(es.previewDialog.loading).toBe("Cargando vista previa…");
    expect(es.previewDialog.unsupported).toBe("Este tipo de archivo no se puede previsualizar.");
    expect(es.previewDialog.tooLarge).toBe("Archivo demasiado grande para previsualizar (máx. 1 MB).");
    expect(es.previewDialog.downloadInstead).toBe("Descargar en su lugar");
    expect(es.previewDialog.error).toBe("No se pudo cargar la vista previa.");
  });
});
