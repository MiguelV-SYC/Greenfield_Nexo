import "@/cargar-entorno"
import { join } from "node:path"

import { PrismaPg } from "@prisma/adapter-pg"
import pino from "pino"

import { PrismaClient } from "@/generated/prisma/client"
import { leerCatalogos } from "@/organizaciones/catalogos/leer-catalogos"
import { sembrarCatalogos } from "@/organizaciones/catalogos/sembrador"

// `prisma db seed` (prisma.config.ts) o `pnpm sembrar`, desde backend/.
// Usa DATABASE_URL_MIGRACIONES: los catálogos son de solo lectura para nexo_app.
async function main(): Promise<void> {
  const log = pino()
  const url = process.env.DATABASE_URL_MIGRACIONES
  if (!url) throw new Error("DATABASE_URL_MIGRACIONES no está definida")
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  })
  try {
    await sembrarCatalogos(
      prisma,
      leerCatalogos(join(process.cwd(), "prisma", "catalogos")),
    )
    log.info("catálogos sembrados")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  pino().error({ err: error }, "falló la siembra de catálogos")
  process.exitCode = 1
})
