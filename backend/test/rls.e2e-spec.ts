import { randomUUID } from "node:crypto"

import type { PrismaClient } from "@/generated/prisma/client"
import { BaseDatosTenant } from "@/common/tenant/base-datos-tenant"
import {
  clienteAplicacion,
  clienteMigrador,
  limpiarBase,
  sembrarCatalogoMinimo,
} from "./utilidades/bd"

const ORG_A = "00000000-0000-4000-8000-00000000000a"
const ORG_B = "00000000-0000-4000-8000-00000000000b"

function organizacion(id: string, nit: string) {
  return {
    id,
    razonSocial: `Organización ${nit}`,
    nit,
    digitoVerificacion: "1",
    repLegalNombre: "Representante",
    enviadaEn: new Date(),
    riesgoMaximo: "I" as const,
    totalTrabajadores: 5,
    estandaresAplicables: 7,
  }
}

function sede(organizacionId: string) {
  return {
    organizacionId,
    nombre: "Sede",
    direccion: "Calle 1",
    departamentoCodigo: "68",
    municipioCodigo: "68001",
    claseRiesgo: "I" as const,
    trabajadores: 5,
    ciiuCodigo: "6201",
  }
}

const LIDER_A = { usuarioId: "lider-a", esAdmin: false }
const LIDER_B = { usuarioId: "lider-b", esAdmin: false }
const ADMIN = { usuarioId: "admin-1", esAdmin: true }

describe("Row-Level Security (migración 0002, ADR-0001)", () => {
  let migrador: PrismaClient
  let aplicacion: PrismaClient
  let bd: BaseDatosTenant

  beforeAll(async () => {
    migrador = clienteMigrador()
    aplicacion = clienteAplicacion()
    bd = new BaseDatosTenant(aplicacion)
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
    for (const [id, nit, lider] of [
      [ORG_A, "900000001", LIDER_A],
      [ORG_B, "900000002", LIDER_B],
    ] as const) {
      await migrador.organizacion.create({ data: organizacion(id, nit) })
      await migrador.miembroOrganizacion.create({
        data: {
          organizacionId: id,
          usuarioId: lider.usuarioId,
          rol: "LIDER_SST",
        },
      })
      await migrador.sede.create({ data: sede(id) })
    }
  })

  afterAll(async () => {
    await limpiarBase(migrador)
    await migrador.$disconnect()
    await aplicacion.$disconnect()
  })

  // Derived from R6.1
  it("un Líder SST solo ve las organizaciones de las que es miembro", async () => {
    const visibles = await bd.ejecutarComo(LIDER_A, (tx) =>
      tx.organizacion.findMany(),
    )
    expect(visibles.map((o) => o.id)).toEqual([ORG_A])
  })

  // Derived from R6.1
  it("una organización ajena no existe para el Líder SST", async () => {
    const ajena = await bd.ejecutarComo(LIDER_A, (tx) =>
      tx.organizacion.findUnique({ where: { id: ORG_B } }),
    )
    expect(ajena).toBeNull()
  })

  // Derived from R6.1
  it("un Líder SST no puede modificar una organización ajena ni sus sedes", async () => {
    const organizaciones = await bd.ejecutarComo(LIDER_A, (tx) =>
      tx.organizacion.updateMany({
        where: { id: ORG_B },
        data: { razonSocial: "Hackeada" },
      }),
    )
    const sedes = await bd.ejecutarComo(LIDER_A, (tx) =>
      tx.sede.deleteMany({ where: { organizacionId: ORG_B } }),
    )
    expect(organizaciones.count).toBe(0)
    expect(sedes.count).toBe(0)
    await expect(
      migrador.sede.count({ where: { organizacionId: ORG_B } }),
    ).resolves.toBe(1)
  })

  // Derived from R6.2
  it("el Administrador ve todas las organizaciones", async () => {
    const visibles = await bd.ejecutarComo(ADMIN, (tx) =>
      tx.organizacion.count(),
    )
    expect(visibles).toBe(2)
  })

  // Derived from NFR3
  it("sin contexto de usuario la aplicación no ve nada", async () => {
    await expect(aplicacion.organizacion.count()).resolves.toBe(0)
    await expect(aplicacion.sede.count()).resolves.toBe(0)
    await expect(aplicacion.miembroOrganizacion.count()).resolves.toBe(0)
  })

  // Derived from R6.1 y R6.3
  it("un Líder SST no puede auditar en nombre de una organización ajena", async () => {
    await expect(
      bd.ejecutarComo(LIDER_A, (tx) =>
        tx.auditoriaCambio.create({
          data: {
            organizacionId: ORG_B,
            usuarioId: LIDER_A.usuarioId,
            entidad: "Organizacion",
            entidadId: ORG_B,
            accion: "EDITAR",
          },
        }),
      ),
    ).rejects.toThrow()
  })

  // Derived from R4.2
  it("el registro crea organización, membresía y sede, y el líder la ve", async () => {
    const id = randomUUID()
    const lider = {
      usuarioId: "lider-nuevo",
      esAdmin: false,
      organizacionNueva: id,
    }
    await bd.ejecutarComo(lider, async (tx) => {
      await tx.organizacion.createMany({
        data: [organizacion(id, "900000003")],
      })
      await tx.miembroOrganizacion.create({
        data: {
          organizacionId: id,
          usuarioId: lider.usuarioId,
          rol: "LIDER_SST",
        },
      })
      await tx.sede.create({ data: sede(id) })
    })
    const propia = await bd.ejecutarComo(
      { usuarioId: "lider-nuevo", esAdmin: false },
      (tx) =>
        tx.organizacion.findUnique({ where: { id }, include: { sedes: true } }),
    )
    expect(propia?.sedes).toHaveLength(1)
  })

  // Derived from R6.1 (nadie se agrega a una organización existente)
  it("un usuario no puede hacerse miembro de una organización existente", async () => {
    await expect(
      bd.ejecutarComo(LIDER_A, (tx) =>
        tx.miembroOrganizacion.create({
          data: {
            organizacionId: ORG_B,
            usuarioId: LIDER_A.usuarioId,
            rol: "LIDER_SST",
          },
        }),
      ),
    ).rejects.toThrow()
  })
})
