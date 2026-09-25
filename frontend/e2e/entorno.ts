import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

export const PUERTO_API = 3100
export const PUERTO_WEB = 3101
export const DIR_BACKEND = join(__dirname, "..", "..", "backend")

/** Variables de backend/.env.pruebas.local: los E2E usan la base nexo_pruebas. */
export function entornoPruebas(): Record<string, string> {
  const archivo = join(DIR_BACKEND, ".env.pruebas.local")
  if (!existsSync(archivo)) {
    throw new Error(
      "Falta backend/.env.pruebas.local (copiar de .env.pruebas.example)",
    )
  }
  const variables: Record<string, string> = {}
  for (const linea of readFileSync(archivo, "utf-8").split(/\r?\n/)) {
    const coincidencia = /^([A-Z_]+)=(.*)$/.exec(linea.trim())
    if (coincidencia) variables[coincidencia[1]] = coincidencia[2]
  }
  return variables
}
