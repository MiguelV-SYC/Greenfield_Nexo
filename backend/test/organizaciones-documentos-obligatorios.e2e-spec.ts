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
  DOCUMENTOS_OBLIGATORIOS,
  crearAplicacion,
  pdfFicticio,
  registrarOrganizacion,
  registroValido,
  solicitudRegistro,
} from "./utilidades/fabricas"

const LIDER = { "x-usuario-mock": "lider-a" }
const ADMIN = { "x-usuario-mock": "admin-1;admin" }

// D6 (Ley 1581, BLOCK): solo datos ficticios.
describe("Registro multipart y documentos obligatorios (T24)", () => {
  let app: INestApplication<App>
  let migrador: PrismaClient

  const http = () => request(app.getHttpServer())
  const registrar = (
    documentos?: string[],
    cuerpo: unknown = registroValido(),
  ) => solicitudRegistro(app, LIDER, cuerpo, documentos)
  const contar = async () => ({
    organizaciones: await migrador.organizacion.count(),
    documentos: await migrador.documentoLegal.count(),
  })

  beforeAll(async () => {
    migrador = clienteMigrador()
    app = await crearAplicacion()
  })

  beforeEach(async () => {
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
  })

  afterAll(async () => {
    await app.close()
    await limpiarBase(migrador)
    await migrador.$disconnect()
  })

  // Derived from R7.1, R7.5 y DEC-4
  it("registra la organización y sus documentos en un solo POST", async () => {
    const r = await registrar([...DOCUMENTOS_OBLIGATORIOS, "NO_AFILIACION_ARL"])
    expect(r.status).toBe(201)
    expect(r.body.estado).toBe("EN_VALIDACION")
    const documentos = await migrador.documentoLegal.findMany({
      where: { organizacionId: r.body.id },
    })
    expect(documentos).toHaveLength(5)
    expect(documentos.every((d) => d.version === 1)).toBe(true)
    expect(
      await migrador.auditoriaCambio.count({
        where: { organizacionId: r.body.id, accion: "CARGAR_DOCUMENTO" },
      }),
    ).toBe(5)
    const lista = await http()
      .get(`/api/v1/organizaciones/${r.body.id}/documentos`)
      .set(LIDER)
    expect(lista.body.faltantes).toEqual([])
  })

  // Derived from R7.5
  it("sin los obligatorios responde 422 indicando cuáles faltan", async () => {
    const r = await registrar(["RUT", "NO_AFILIACION_ARL"])
    expect(r.status).toBe(422)
    expect(r.body.faltantes).toEqual([
      "CAMARA_COMERCIO",
      "CEDULA_REP_LEGAL",
      "FORMULARIO_ARL",
    ])
    expect(r.body.message).toBe(
      "Faltan documentos obligatorios: Certificado de Cámara de Comercio, " +
        "Cédula del representante legal, Formulario de afiliación a ARL",
    )
    expect(await contar()).toEqual({ organizaciones: 0, documentos: 0 })
  })

  // Derived from R7.5
  it("un registro JSON sin archivos también responde 422", async () => {
    const r = await http()
      .post("/api/v1/organizaciones")
      .set(LIDER)
      .send(registroValido())
    expect(r.status).toBe(422)
    expect(r.body.faltantes).toEqual(DOCUMENTOS_OBLIGATORIOS)
  })

  // Derived from R7.3
  it("rechaza el registro si un archivo no es PDF ni imagen", async () => {
    const r = await solicitudRegistro(app, LIDER, registroValido(), [
      "RUT",
      "CAMARA_COMERCIO",
      "CEDULA_REP_LEGAL",
    ]).attach("FORMULARIO_ARL", Buffer.from("MZ ejecutable"), "arl.pdf")
    expect(r.status).toBe(415)
    expect(await contar()).toEqual({ organizaciones: 0, documentos: 0 })
  })

  // Derived from R7.9
  it("rechaza el registro si un archivo supera 10 MB", async () => {
    const r = await solicitudRegistro(app, LIDER, registroValido(), [
      "RUT",
      "CAMARA_COMERCIO",
      "CEDULA_REP_LEGAL",
    ]).attach(
      "FORMULARIO_ARL",
      pdfFicticio("grande", 10 * 1024 * 1024 + 1),
      "arl.pdf",
    )
    expect(r.status).toBe(413)
    expect(r.body.message).toMatch(/10 MB/)
    expect(await contar()).toEqual({ organizaciones: 0, documentos: 0 })
  })

  it("exige el campo datos en JSON válido", async () => {
    const sinDatos = await http()
      .post("/api/v1/organizaciones")
      .set(LIDER)
      .attach("RUT", pdfFicticio("rut"), "rut.pdf")
    expect(sinDatos.status).toBe(400)
    expect(sinDatos.body.errores[0].campo).toBe("datos")
    const malFormado = await http()
      .post("/api/v1/organizaciones")
      .set(LIDER)
      .field("datos", "{no es json")
    expect(malFormado.status).toBe(400)
    expect(malFormado.body.errores[0].campo).toBe("datos")
  })

  // Derived from R1.7
  it("con NIT duplicado responde 409 sin guardar documentos", async () => {
    await registrar()
    const r = await registrar()
    expect(r.status).toBe(409)
    expect(await contar()).toEqual({ organizaciones: 1, documentos: 4 })
  })

  describe("reenvío (R7.5)", () => {
    const devolver = (id: string) =>
      http()
        .post(`/api/v1/admin/organizaciones/${id}/devolucion`)
        .set(ADMIN)
        .send({ motivo: "Revisar datos" })
    const reenviar = (id: string) =>
      http().post(`/api/v1/organizaciones/${id}/reenvio`).set(LIDER)

    // Derived from R7.5, R4.7
    it("reenvía una organización con los obligatorios completos", async () => {
      const id = await registrarOrganizacion(app, LIDER)
      await devolver(id)
      const r = await reenviar(id)
      expect(r.status).toBe(200)
      expect(r.body.estado).toBe("EN_VALIDACION")
    })

    // Derived from R7.5
    it("no reenvía si faltan obligatorios, y sí tras cargarlos", async () => {
      const id = await registrarOrganizacion(app, LIDER)
      await devolver(id)
      // Como una organización registrada antes de P2 (el migrador sí puede borrar).
      await migrador.documentoLegal.deleteMany({
        where: { organizacionId: id, tipo: { in: ["RUT", "FORMULARIO_ARL"] } },
      })
      const rechazo = await reenviar(id)
      expect(rechazo.status).toBe(422)
      expect(rechazo.body.faltantes).toEqual(["RUT", "FORMULARIO_ARL"])
      expect(
        (await migrador.organizacion.findUniqueOrThrow({ where: { id } }))
          .estado,
      ).toBe("DEVUELTA")
      for (const tipo of ["RUT", "FORMULARIO_ARL"]) {
        await http()
          .put(`/api/v1/organizaciones/${id}/documentos/${tipo}`)
          .set(LIDER)
          .attach("archivo", pdfFicticio(tipo), `${tipo}.pdf`)
      }
      expect((await reenviar(id)).status).toBe(200)
    })
  })
})
