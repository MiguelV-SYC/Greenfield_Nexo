import { readFileSync } from "node:fs"
import { join } from "node:path"

import type { Catalogos } from "./catalogos.tipos"

function leerJson<T>(directorio: string, archivo: string, lista: string): T {
  const contenido: unknown = JSON.parse(
    readFileSync(join(directorio, archivo), "utf-8"),
  )
  const registro = contenido as Record<string, unknown>
  if (
    !Array.isArray(registro[lista]) ||
    typeof registro.fechaCorte !== "string"
  ) {
    throw new Error(`${archivo}: falta "${lista}" o "fechaCorte"`)
  }
  return contenido as T
}

export function leerCatalogos(directorio: string): Catalogos {
  return {
    divipola: leerJson(directorio, "divipola.json", "municipios"),
    ciiu: leerJson(directorio, "ciiu.json", "actividades"),
    arl: leerJson(directorio, "arl.json", "arl"),
  }
}
