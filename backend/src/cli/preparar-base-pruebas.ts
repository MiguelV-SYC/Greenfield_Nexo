import "@/cargar-entorno"
import { join } from "node:path"

import { PrismaPg } from "@prisma/adapter-pg"
import pino from "pino"

import { PrismaClient } from "@/generated/prisma/client"
import { leerCatalogos } from "@/organizaciones/catalogos/leer-catalogos"
import { sembrarCatalogos } from "@/organizaciones/catalogos/sembrador"

// Deja la base de pruebas lista para los E2E (T20): sin organizaciones y con
// los catálogos sembrados. Solo corre sobre bases cuyo nombre termina en
// `_pruebas`, para que nunca pueda vaciar datos de desarrollo o producción.
const TABLAS =
  '"AuditoriaCambio", "MiembroOrganizacion", "Sede", "Organizacion"'

function exigirBasePruebas(url: string): void {
  const base = new URL(url).pathname.replace(/^\//, "")
  if (!base.endsWith("_pruebas")) {
    throw new Error(
      `Se niega a limpiar la base "${base}": no termina en _pruebas`,
    )
  }
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL_MIGRACIONES
  if (!url) throw new Error("DATABASE_URL_MIGRACIONES no está definida")
  exigirBasePruebas(url)
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  })
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE ${TABLAS} CASCADE`)
    await sembrarCatalogos(
      prisma,
      leerCatalogos(join(process.cwd(), "prisma", "catalogos")),
    )
    pino().info("base de pruebas preparada")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  pino().error({ err: error }, "falló la preparación de la base de pruebas")
  process.exitCode = 1
})
