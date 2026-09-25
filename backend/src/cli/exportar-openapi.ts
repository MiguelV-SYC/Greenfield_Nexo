import "@/cargar-entorno"
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"

import { NestFactory } from "@nestjs/core"
import pino from "pino"

import { AppModule } from "@/app.module"
import { configurarAplicacion, crearDocumentoOpenApi } from "@/app.setup"

// `pnpm openapi` desde backend/: escribe el contrato que consume el frontend
// (frontend/src/lib/api/openapi.json → tipos con openapi-typescript).
async function main(): Promise<void> {
  const destino = resolve(
    process.argv[2] ?? "../frontend/src/lib/api/openapi.json",
  )
  const app = await NestFactory.create(AppModule, {
    logger: ["error"],
    abortOnError: false,
  })
  configurarAplicacion(app)
  const documento = crearDocumentoOpenApi(app)
  writeFileSync(destino, `${JSON.stringify(documento, null, 2)}\n`, "utf-8")
  await app.close()
  pino().info({ destino }, "OpenAPI exportado")
}

main().catch((error: unknown) => {
  pino().error({ err: error }, "falló la exportación del OpenAPI")
  process.exitCode = 1
})
