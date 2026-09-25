import { existsSync } from "node:fs"

// stack/testing.md: la integración corre contra la base `nexo_pruebas` de
// Compose. Las variables ya definidas en el entorno (CI) tienen prioridad.
const ARCHIVO_ENTORNO_PRUEBAS = ".env.pruebas.local"

export function cargarEntornoPruebas(): void {
  if (existsSync(ARCHIVO_ENTORNO_PRUEBAS)) {
    process.loadEnvFile(ARCHIVO_ENTORNO_PRUEBAS)
  }
}
