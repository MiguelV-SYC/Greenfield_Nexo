import type { PrismaClient } from "@/generated/prisma/client"
import type { Catalogos } from "./catalogos.tipos"

type Transaccion = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]

async function registrarVersion(
  tx: Transaccion,
  catalogo: string,
  version: string,
  fechaCorte: string,
): Promise<void> {
  const datos = { version, fechaCorte: new Date(fechaCorte) }
  await tx.catalogoVersion.upsert({
    where: { catalogo },
    create: { catalogo, ...datos },
    update: datos,
  })
}

async function sembrarDivipola(
  tx: Transaccion,
  { divipola }: Catalogos,
): Promise<void> {
  for (const d of divipola.departamentos) {
    await tx.departamento.upsert({
      where: { codigo: d.codigo },
      create: d,
      update: d,
    })
  }
  for (const m of divipola.municipios) {
    await tx.municipio.upsert({
      where: { codigo: m.codigo },
      create: m,
      update: m,
    })
  }
  await registrarVersion(tx, "divipola", divipola.version, divipola.fechaCorte)
}

/**
 * Carga o actualiza los catálogos globales (DEC-7). Idempotente: desmockear
 * D3–D5 es reemplazar el JSON y volver a sembrar. Requiere nexo_migrador:
 * nexo_app solo puede leer los catálogos.
 */
export async function sembrarCatalogos(
  prisma: PrismaClient,
  catalogos: Catalogos,
): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      await sembrarDivipola(tx, catalogos)
      for (const a of catalogos.ciiu.actividades) {
        await tx.actividadCiiu.upsert({
          where: { codigo: a.codigo },
          create: a,
          update: a,
        })
      }
      await registrarVersion(
        tx,
        "ciiu",
        catalogos.ciiu.version,
        catalogos.ciiu.fechaCorte,
      )
      for (const a of catalogos.arl.arl) {
        await tx.arl.upsert({
          where: { codigo: a.codigo },
          create: a,
          update: a,
        })
      }
      await registrarVersion(
        tx,
        "arl",
        catalogos.arl.version,
        catalogos.arl.fechaCorte,
      )
    },
    { timeout: 120_000 },
  )
}
