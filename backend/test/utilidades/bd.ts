import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"

function urlRequerida(
  nombre: "DATABASE_URL" | "DATABASE_URL_MIGRACIONES",
): string {
  const url = process.env[nombre]
  if (!url)
    throw new Error(`${nombre} no está definida para los tests de integración`)
  return url
}

/** Cliente con el rol de la aplicación (nexo_app): sujeto a grants y RLS. */
export function clienteAplicacion(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: urlRequerida("DATABASE_URL") }),
  })
}

/** Cliente con el rol dueño del esquema (nexo_migrador): prepara y limpia datos. */
export function clienteMigrador(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: urlRequerida("DATABASE_URL_MIGRACIONES"),
    }),
  })
}

const TABLAS_DE_NEGOCIO = [
  "AuditoriaCambio",
  "MiembroOrganizacion",
  "Sede",
  "Organizacion",
]
const TABLAS_DE_CATALOGO = [
  "Municipio",
  "Departamento",
  "ActividadCiiu",
  "Arl",
  "CatalogoVersion",
]

export async function limpiarBase(migrador: PrismaClient): Promise<void> {
  const tablas = [...TABLAS_DE_NEGOCIO, ...TABLAS_DE_CATALOGO]
    .map((t) => `"${t}"`)
    .join(", ")
  await migrador.$executeRawUnsafe(`TRUNCATE ${tablas} CASCADE`)
}

/** Catálogo mínimo para los tests: Santander (Bucaramanga) y Antioquia (Medellín). */
export async function sembrarCatalogoMinimo(
  migrador: PrismaClient,
): Promise<void> {
  await migrador.departamento.createMany({
    data: [
      { codigo: "68", nombre: "Santander" },
      { codigo: "05", nombre: "Antioquia" },
    ],
  })
  await migrador.municipio.createMany({
    data: [
      { codigo: "68001", nombre: "Bucaramanga", departamentoCodigo: "68" },
      { codigo: "05001", nombre: "Medellín", departamentoCodigo: "05" },
    ],
  })
  await migrador.actividadCiiu.create({
    data: {
      codigo: "6201",
      descripcion: "Actividades de desarrollo de sistemas informáticos",
    },
  })
  await migrador.arl.create({ data: { codigo: "aurora", nombre: "Aurora" } })
}
