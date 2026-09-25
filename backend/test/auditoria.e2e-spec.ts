import type { PrismaClient } from "@/generated/prisma/client"
import { AuditoriaService } from "@/common/auditoria/auditoria.service"
import { BaseDatosTenant } from "@/common/tenant/base-datos-tenant"
import {
  clienteAplicacion,
  clienteMigrador,
  limpiarBase,
  sembrarCatalogoMinimo,
} from "./utilidades/bd"

const ORG = "00000000-0000-4000-8000-0000000000c1"
const LIDER = { usuarioId: "lider-c", esAdmin: false }
const ADMIN = { usuarioId: "admin-1", esAdmin: true }

describe("AuditoriaService (append-only)", () => {
  let migrador: PrismaClient
  let aplicacion: PrismaClient
  let bd: BaseDatosTenant
  const auditoria = new AuditoriaService()

  beforeAll(async () => {
    migrador = clienteMigrador()
    aplicacion = clienteAplicacion()
    bd = new BaseDatosTenant(aplicacion)
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
    await migrador.organizacion.create({
      data: {
        id: ORG,
        razonSocial: "Org C",
        nit: "900000010",
        digitoVerificacion: "1",
        repLegalNombre: "Rep",
        enviadaEn: new Date(),
        riesgoMaximo: "I",
        totalTrabajadores: 3,
        estandaresAplicables: 7,
      },
    })
    await migrador.miembroOrganizacion.create({
      data: {
        organizacionId: ORG,
        usuarioId: LIDER.usuarioId,
        rol: "LIDER_SST",
      },
    })
  })

  afterAll(async () => {
    await limpiarBase(migrador)
    await migrador.$disconnect()
    await aplicacion.$disconnect()
  })

  // Derived from R6.3 y NFR4
  it("registra quién, cuándo, la acción y los valores anterior y nuevo", async () => {
    await bd.ejecutarComo(LIDER, (tx) =>
      auditoria.registrar(tx, LIDER.usuarioId, {
        organizacionId: ORG,
        entidad: "Organizacion",
        entidadId: ORG,
        accion: "REENVIAR",
        valorAnterior: { estado: "DEVUELTA" },
        valorNuevo: { estado: "EN_VALIDACION" },
      }),
    )
    const [registro] = await migrador.auditoriaCambio.findMany({
      where: { accion: "REENVIAR" },
    })
    expect(registro).toMatchObject({
      organizacionId: ORG,
      usuarioId: LIDER.usuarioId,
      entidad: "Organizacion",
      valorAnterior: { estado: "DEVUELTA" },
      valorNuevo: { estado: "EN_VALIDACION" },
    })
    expect(registro.creadoEn).toBeInstanceOf(Date)
  })

  // Derived from R6.4
  it("conserva el motivo de una devolución registrada por el Administrador", async () => {
    await bd.ejecutarComo(ADMIN, (tx) =>
      auditoria.registrar(tx, ADMIN.usuarioId, {
        organizacionId: ORG,
        entidad: "Organizacion",
        entidadId: ORG,
        accion: "DEVOLVER",
        motivo: "El RUT no corresponde a la razón social",
      }),
    )
    const registro = await migrador.auditoriaCambio.findFirst({
      where: { accion: "DEVOLVER" },
    })
    expect(registro?.motivo).toBe("El RUT no corresponde a la razón social")
  })

  // Derived from R6.3 (nadie firma en nombre de otro)
  it("rechaza registrar en nombre de otro usuario", async () => {
    await expect(
      bd.ejecutarComo(LIDER, (tx) =>
        auditoria.registrar(tx, "otro-usuario", {
          organizacionId: ORG,
          entidad: "Organizacion",
          entidadId: ORG,
          accion: "EDITAR",
        }),
      ),
    ).rejects.toThrow()
  })
})
