import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"

import { DIR_BACKEND, entornoPruebas } from "./entorno"

// globalSetup: migra y limpia nexo_pruebas y siembra los catálogos. Requiere
// el backend compilado (`pnpm --filter @nexo/backend build`).
export default function prepararBase(): void {
  const cli = join(DIR_BACKEND, "dist", "cli", "preparar-base-pruebas.js")
  if (!existsSync(cli)) throw new Error("Compila el backend antes de los E2E")
  const env = { ...process.env, ...entornoPruebas() }
  const prisma = require.resolve("prisma/build/index.js", {
    paths: [DIR_BACKEND],
  })
  execFileSync(process.execPath, [prisma, "migrate", "deploy"], {
    cwd: DIR_BACKEND,
    env,
    stdio: "pipe",
  })
  execFileSync(process.execPath, [cli], {
    cwd: DIR_BACKEND,
    env,
    stdio: "pipe",
  })
}
