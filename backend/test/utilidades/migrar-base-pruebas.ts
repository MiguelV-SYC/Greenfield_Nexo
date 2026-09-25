import { execFileSync } from "node:child_process"

import { cargarEntornoPruebas } from "./entorno"

// globalSetup de Jest: deja `nexo_pruebas` con todas las migraciones aplicadas.
export default function migrarBasePruebas(): void {
  cargarEntornoPruebas()
  execFileSync(
    process.execPath,
    [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
    {
      stdio: "pipe",
      env: process.env,
    },
  )
}
