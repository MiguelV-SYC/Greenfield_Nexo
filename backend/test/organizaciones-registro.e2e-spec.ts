import type { INestApplication } from "@nestjs/common"
import request from "supertest"
import type { App } from "supertest/types"

import type { PrismaClient } from "@/generated/prisma/client"
import {
  clienteMigrador,
  limpiarBase,
  sembrarCatalogoMinimo,
} from "./utilidades/bd"
import {
  crearAplicacion,
  registroValido,
  sedeValida,
} from "./utilidades/fabricas"

const LIDER = "lider-registro"

describe("POST /organizaciones — registro (T13)", () => {
  let app: INestApplication<App>
  let migrador: PrismaClient

  beforeAll(async () => {
    migrador = clienteMigrador()
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
    app = await crearAplicacion()
  })

  afterEach(async () => {
    await migrador.$executeRawUnsafe(
      'TRUNCATE "AuditoriaCambio", "MiembroOrganizacion", "Sede", "Organizacion" CASCADE',
    )
  })

  afterAll(async () => {
    await app.close()
    await limpiarBase(migrador)
    await migrador.$disconnect()
  })

  const registrar = (cuerpo: unknown, usuario = LIDER) =>
    request(app.getHttpServer())
      .post("/api/v1/organizaciones")
      .set("x-usuario-mock", usuario)
      .send(cuerpo as object)

  const camposConError = (cuerpo: { errores: { campo: string }[] }) =>
    cuerpo.errores.map((e) => e.campo)

  // Derived from R4.1, R3.5 y R1.2
  it("registra la organización en validación con sus estándares aplicables", async () => {
    const respuesta = await registrar(
      registroValido({
        sedes: [
          sedeValida(),
          sedeValida({ claseRiesgo: "IV", trabajadores: 3 }),
        ],
      }),
    )
    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toMatchObject({
      estado: "EN_VALIDACION",
      nit: "800197268",
      riesgoMaximo: "IV",
      totalTrabajadores: 15,
      estandaresAplicables: 62,
      arlCodigo: "aurora",
      repLegalTipoDoc: "CC",
    })
    expect(respuesta.body.sedes).toHaveLength(2)
    expect(new Date(respuesta.body.enviadaEn).getTime()).toBeLessThanOrEqual(
      Date.now(),
    )
  })

  // Derived from R4.2
  it("asocia a quien registra como Líder SST", async () => {
    const respuesta = await registrar(registroValido())
    const miembros = await migrador.miembroOrganizacion.findMany({
      where: { organizacionId: respuesta.body.id },
    })
    expect(miembros).toEqual([
      expect.objectContaining({ usuarioId: LIDER, rol: "LIDER_SST" }),
    ])
  })

  // Derived from R6.3
  it("audita el registro", async () => {
    const respuesta = await registrar(registroValido())
    const auditoria = await migrador.auditoriaCambio.findMany({
      where: { organizacionId: respuesta.body.id },
    })
    expect(auditoria).toEqual([
      expect.objectContaining({
        usuarioId: LIDER,
        accion: "REGISTRAR",
        entidad: "Organizacion",
      }),
    ])
  })

  // Derived from R1.8
  it("muestra la razón social cuando no hay nombre comercial", async () => {
    const respuesta = await registrar(
      registroValido({ nombreComercial: undefined }),
    )
    expect(respuesta.body.nombreVisible).toBe(
      "Dirección de Impuestos y Aduanas Nacionales",
    )
  })

  // Derived from R1.1, R1.3 y R1.4
  it.each([
    "razonSocial",
    "nit",
    "digitoVerificacion",
    "tipoPersona",
    "repLegalNombre",
  ])("exige %s", async (campo) => {
    const respuesta = await registrar(registroValido({ [campo]: undefined }))
    expect(respuesta.status).toBe(400)
    expect(camposConError(respuesta.body)).toContain(campo)
  })

  // Derived from R1.1
  it("no acepta una razón social en blanco", async () => {
    const respuesta = await registrar(registroValido({ razonSocial: "   " }))
    expect(camposConError(respuesta.body)).toEqual(["razonSocial"])
  })

  // Derived from R1.5
  it("rechaza un NIT con caracteres distintos de dígitos", async () => {
    const respuesta = await registrar(registroValido({ nit: "800-197268" }))
    expect(respuesta.status).toBe(400)
    expect(camposConError(respuesta.body)).toContain("nit")
  })

  // Derived from R1.6
  it("rechaza un dígito de verificación que no corresponde al NIT", async () => {
    const respuesta = await registrar(
      registroValido({ digitoVerificacion: "5" }),
    )
    expect(respuesta.status).toBe(400)
    expect(camposConError(respuesta.body)).toEqual(["digitoVerificacion"])
  })

  // Derived from R1.7
  it("rechaza un NIT registrado, aunque la otra organización esté devuelta", async () => {
    const primera = await registrar(registroValido())
    await migrador.organizacion.update({
      where: { id: primera.body.id },
      data: { estado: "DEVUELTA", motivoDevolucion: "Prueba" },
    })
    const respuesta = await registrar(
      registroValido({ razonSocial: "Otra" }),
      "otro-lider",
    )
    expect(respuesta.status).toBe(409)
    expect(respuesta.body.message).toMatch(/NIT ya está registrado/)
  })

  // Derived from R1.9
  it("rechaza una ARL fuera del catálogo", async () => {
    const respuesta = await registrar(
      registroValido({ arlCodigo: "inventada" }),
    )
    expect(camposConError(respuesta.body)).toEqual(["arlCodigo"])
  })

  // Derived from R2.1
  it("exige al menos una sede", async () => {
    const respuesta = await registrar(registroValido({ sedes: [] }))
    expect(camposConError(respuesta.body)).toEqual(["sedes"])
  })

  // Derived from R2.2
  it("exige todos los campos de la sede", async () => {
    const respuesta = await registrar(
      registroValido({ sedes: [sedeValida({ direccion: "" })] }),
    )
    expect(camposConError(respuesta.body)).toEqual(["sedes.0.direccion"])
  })

  // Derived from R2.3 y R2.4
  it("rechaza clase de riesgo y trabajadores inválidos", async () => {
    const sede = sedeValida({ claseRiesgo: "VI", trabajadores: 0 })
    const respuesta = await registrar(registroValido({ sedes: [sede] }))
    expect(camposConError(respuesta.body)).toEqual([
      "sedes.0.claseRiesgo",
      "sedes.0.trabajadores",
    ])
  })

  // Derived from R2.5 y R2.6
  it("rechaza un municipio que no pertenece al departamento", async () => {
    const sede = sedeValida({ municipioCodigo: "05001" })
    const respuesta = await registrar(
      registroValido({ sedes: [sedeValida(), sede] }),
    )
    expect(camposConError(respuesta.body)).toEqual(["sedes.1.municipioCodigo"])
  })

  // Derived from R2.7
  it("rechaza una actividad fuera del catálogo CIIU", async () => {
    const respuesta = await registrar(
      registroValido({ sedes: [sedeValida({ ciiuCodigo: "9999" })] }),
    )
    expect(camposConError(respuesta.body)).toEqual(["sedes.0.ciiuCodigo"])
  })

  it("exige identidad", async () => {
    const respuesta = await request(app.getHttpServer())
      .post("/api/v1/organizaciones")
      .send(registroValido())
    expect(respuesta.status).toBe(401)
  })
})
