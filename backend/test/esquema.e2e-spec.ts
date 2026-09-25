import type { PrismaClient } from "@/generated/prisma/client"
import {
  clienteAplicacion,
  clienteMigrador,
  limpiarBase,
  sembrarCatalogoMinimo,
} from "./utilidades/bd"

const ORGANIZACION_BASE = {
  razonSocial: "Sistemas y Computadores S.A.",
  nit: "890206391",
  digitoVerificacion: "5",
  repLegalNombre: "Representante de prueba",
  enviadaEn: new Date(),
  riesgoMaximo: "III" as const,
  totalTrabajadores: 10,
  estandaresAplicables: 7,
}

const SEDE_BASE = {
  nombre: "Oficina principal",
  direccion: "Calle 1 # 2-3",
  departamentoCodigo: "68",
  municipioCodigo: "68001",
  claseRiesgo: "III" as const,
  trabajadores: 10,
  ciiuCodigo: "6201",
}

describe("Esquema de la base (migración 0001)", () => {
  let migrador: PrismaClient
  let aplicacion: PrismaClient

  beforeAll(async () => {
    migrador = clienteMigrador()
    aplicacion = clienteAplicacion()
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
  })

  afterEach(async () => {
    await migrador.$executeRawUnsafe(
      'TRUNCATE "AuditoriaCambio", "MiembroOrganizacion", "Sede", "Organizacion" CASCADE',
    )
  })

  afterAll(async () => {
    await limpiarBase(migrador)
    await migrador.$disconnect()
    await aplicacion.$disconnect()
  })

  // Derived from R1.5
  it("rechaza un NIT con caracteres distintos de dígitos", async () => {
    await expect(
      migrador.organizacion.create({
        data: { ...ORGANIZACION_BASE, nit: "89020639A" },
      }),
    ).rejects.toThrow()
  })

  // Derived from R1.7
  it("rechaza un NIT ya registrado", async () => {
    await migrador.organizacion.create({ data: ORGANIZACION_BASE })
    await expect(
      migrador.organizacion.create({
        data: { ...ORGANIZACION_BASE, razonSocial: "Otra" },
      }),
    ).rejects.toThrow()
  })

  // Derived from R3.1
  it("solo admite 7, 21 o 62 estándares aplicables", async () => {
    await expect(
      migrador.organizacion.create({
        data: { ...ORGANIZACION_BASE, estandaresAplicables: 30 },
      }),
    ).rejects.toThrow()
  })

  // Derived from R4.5
  it("exige motivo en una organización Devuelta", async () => {
    await expect(
      migrador.organizacion.create({
        data: {
          ...ORGANIZACION_BASE,
          estado: "DEVUELTA",
          motivoDevolucion: "   ",
        },
      }),
    ).rejects.toThrow()
  })

  // Derived from R2.4
  it("rechaza una sede con menos de un trabajador", async () => {
    const organizacion = await migrador.organizacion.create({
      data: ORGANIZACION_BASE,
    })
    await expect(
      migrador.sede.create({
        data: {
          ...SEDE_BASE,
          organizacionId: organizacion.id,
          trabajadores: 0,
        },
      }),
    ).rejects.toThrow()
  })

  // Derived from R2.6
  it("rechaza un municipio que no pertenece al departamento", async () => {
    const organizacion = await migrador.organizacion.create({
      data: ORGANIZACION_BASE,
    })
    await expect(
      migrador.sede.create({
        data: {
          ...SEDE_BASE,
          organizacionId: organizacion.id,
          municipioCodigo: "05001",
        },
      }),
    ).rejects.toThrow()
  })

  // Derived from R6.3 y NFR4
  it("la aplicación no puede modificar ni borrar la auditoría", async () => {
    const registro = await migrador.auditoriaCambio.create({
      data: {
        organizacionId: "00000000-0000-0000-0000-000000000001",
        usuarioId: "u1",
        entidad: "Organizacion",
        entidadId: "x",
        accion: "REGISTRAR",
      },
    })
    await expect(
      aplicacion.auditoriaCambio.update({
        where: { id: registro.id },
        data: { accion: "OTRA" },
      }),
    ).rejects.toThrow()
    await expect(
      aplicacion.auditoriaCambio.delete({ where: { id: registro.id } }),
    ).rejects.toThrow()
  })

  // Derived from R2.5 (catálogos de solo lectura, DEC-7)
  it("la aplicación puede leer los catálogos pero no modificarlos", async () => {
    await expect(aplicacion.departamento.count()).resolves.toBe(2)
    await expect(
      aplicacion.departamento.create({
        data: { codigo: "99", nombre: "Inventado" },
      }),
    ).rejects.toThrow()
  })

  it("la aplicación no tiene acceso al historial de migraciones", async () => {
    await expect(
      aplicacion.$queryRawUnsafe('SELECT count(*) FROM "_prisma_migrations"'),
    ).rejects.toThrow()
  })
})
