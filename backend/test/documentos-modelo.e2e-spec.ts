import type { PrismaClient } from "@/generated/prisma/client"
import { BaseDatosTenant } from "@/common/tenant/base-datos-tenant"
import {
  clienteAplicacion,
  clienteMigrador,
  limpiarBase,
  sembrarCatalogoMinimo,
} from "./utilidades/bd"

const ORG_A = "00000000-0000-4000-8000-0000000000a1"
const ORG_B = "00000000-0000-4000-8000-0000000000b1"
const LIDER_A = { usuarioId: "lider-a", esAdmin: false }
const LIDER_B = { usuarioId: "lider-b", esAdmin: false }
const ADMIN = { usuarioId: "admin-1", esAdmin: true }
const DIEZ_MB = 10 * 1024 * 1024

function documento(sobrescribir: Record<string, unknown> = {}) {
  return {
    organizacionId: ORG_A,
    tipo: "RUT" as const,
    version: 1,
    objetoClave: `organizaciones/${ORG_A}/RUT`,
    objetoVersion: "v1",
    nombreArchivo: "rut.pdf",
    tipoMime: "application/pdf",
    tamanoBytes: 2048,
    cargadoPor: "lider-a",
    ...sobrescribir,
  }
}

describe("Modelo de documentos legales (migración 0003, T22)", () => {
  let migrador: PrismaClient
  let aplicacion: PrismaClient
  let bd: BaseDatosTenant

  beforeAll(async () => {
    migrador = clienteMigrador()
    aplicacion = clienteAplicacion()
    bd = new BaseDatosTenant(aplicacion)
  })

  beforeEach(async () => {
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
    for (const [id, nit, lider] of [
      [ORG_A, "900000011", "lider-a"],
      [ORG_B, "900000012", "lider-b"],
    ] as const) {
      await migrador.organizacion.create({
        data: {
          id,
          razonSocial: `Organización ${nit}`,
          nit,
          digitoVerificacion: "1",
          repLegalNombre: "Representante",
          enviadaEn: new Date(),
          riesgoMaximo: "I",
          totalTrabajadores: 5,
          estandaresAplicables: 7,
        },
      })
      await migrador.miembroOrganizacion.create({
        data: { organizacionId: id, usuarioId: lider, rol: "LIDER_SST" },
      })
    }
  })

  afterAll(async () => {
    await limpiarBase(migrador)
    await migrador.$disconnect()
    await aplicacion.$disconnect()
  })

  const cargar = (contexto: typeof LIDER_A, datos = documento()) =>
    bd.ejecutarComo(contexto, (tx) => tx.documentoLegal.create({ data: datos }))
  const contar = (contexto: typeof LIDER_A) =>
    bd.ejecutarComo(contexto, (tx) => tx.documentoLegal.count())

  // Derived from R7.7 y R6.1
  it("solo los miembros y el Administrador ven los documentos", async () => {
    await cargar(LIDER_A)
    await expect(contar(LIDER_A)).resolves.toBe(1)
    await expect(contar(ADMIN)).resolves.toBe(1)
    await expect(contar(LIDER_B)).resolves.toBe(0)
  })

  // Derived from R7.7
  it("solo un miembro carga, y en su propio nombre", async () => {
    await expect(cargar(LIDER_B)).rejects.toThrow()
    await expect(cargar(ADMIN)).rejects.toThrow()
    await expect(
      cargar(LIDER_A, documento({ cargadoPor: "lider-b" })),
    ).rejects.toThrow()
  })

  // Derived from R7.8
  it("la aplicación no puede modificar ni borrar un documento", async () => {
    await cargar(LIDER_A)
    await expect(
      aplicacion.$executeRawUnsafe(
        `UPDATE "DocumentoLegal" SET "nombreArchivo" = 'otro.pdf'`,
      ),
    ).rejects.toThrow(/permission denied/)
    await expect(
      aplicacion.$executeRawUnsafe(`DELETE FROM "DocumentoLegal"`),
    ).rejects.toThrow(/permission denied/)
  })

  // Derived from R7.4
  it("cada versión es una fila nueva; no se repite el número de versión", async () => {
    await cargar(LIDER_A)
    await cargar(LIDER_A, documento({ version: 2, objetoVersion: "v2" }))
    await expect(contar(LIDER_A)).resolves.toBe(2)
    await expect(cargar(LIDER_A)).rejects.toThrow()
  })

  // Derived from R7.9 y R7.2
  it.each([
    ["más de 10 MB", { tamanoBytes: DIEZ_MB + 1 }],
    ["vacío", { tamanoBytes: 0 }],
    ["que no es PDF ni imagen", { tipoMime: "application/zip" }],
    ["con versión 0", { version: 0 }],
  ])("rechaza un documento %s", async (_caso, cambio) => {
    await expect(cargar(LIDER_A, documento(cambio))).rejects.toThrow()
  })

  it("acepta un documento de exactamente 10 MB", async () => {
    await expect(
      cargar(LIDER_A, documento({ tamanoBytes: DIEZ_MB })),
    ).resolves.toMatchObject({ tamanoBytes: DIEZ_MB })
  })
})
