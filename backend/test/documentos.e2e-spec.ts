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
  pdfFicticio,
  registrarOrganizacion,
} from "./utilidades/fabricas"

const LIDER = { "x-usuario-mock": "lider-a" }
const OTRO_LIDER = { "x-usuario-mock": "lider-b" }
const ADMIN = { "x-usuario-mock": "admin-1;admin" }
const DIEZ_MB = 10 * 1024 * 1024

// D6 (Ley 1581, BLOCK): solo datos ficticios; ningún documento real del piloto.
describe("Documentos legales: carga, listado y URL firmada (T23)", () => {
  let app: INestApplication<App>
  let migrador: PrismaClient
  let id: string

  const http = () => request(app.getHttpServer())
  const ruta = (sufijo = "", organizacion = id) =>
    `/api/v1/organizaciones/${organizacion}/documentos${sufijo}`
  const cargar = (
    tipo: string,
    contenido: Buffer,
    quien = LIDER,
    nombre = "rut.pdf",
  ) =>
    http()
      .put(ruta(`/${tipo}`))
      .set(quien)
      .attach("archivo", contenido, {
        filename: nombre,
        contentType: "application/pdf",
      })
  const listar = (quien = LIDER, organizacion = id) =>
    http().get(ruta("", organizacion)).set(quien)
  const url = (tipo: string, quien = LIDER) =>
    http()
      .get(ruta(`/${tipo}/url`))
      .set(quien)
  const devolver = () =>
    http()
      .post(`/api/v1/admin/organizaciones/${id}/devolucion`)
      .set(ADMIN)
      .send({ motivo: "Falta el RUT" })

  beforeAll(async () => {
    migrador = clienteMigrador()
    app = await crearAplicacion()
  })

  beforeEach(async () => {
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
    id = await registrarOrganizacion(app, LIDER)
    await devolver()
  })

  afterAll(async () => {
    await app.close()
    await limpiarBase(migrador)
    await migrador.$disconnect()
  })

  // Derived from R7.1, R7.2
  it("carga un PDF y lo lista como versión vigente", async () => {
    const r = await cargar("RUT", pdfFicticio("rut"), LIDER, "RUT 2026 ñ.pdf")
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({
      version: 1,
      nombreArchivo: "RUT 2026 ñ.pdf",
      tipoMime: "application/pdf",
    })
    const lista = await listar()
    expect(lista.status).toBe(200)
    expect(lista.body.documentos.map((d: { tipo: string }) => d.tipo)).toEqual([
      "RUT",
      "CAMARA_COMERCIO",
      "CEDULA_REP_LEGAL",
      "FORMULARIO_ARL",
      "NO_AFILIACION_ARL",
    ])
    expect(lista.body.documentos[0].vigente).toMatchObject({ version: 1 })
    expect(lista.body.faltantes).not.toContain("RUT")
  })

  // Derived from R7.2
  it("acepta una imagen aunque el cliente declare otro tipo", async () => {
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from("IHDR ficticio"),
    ])
    const r = await cargar("CEDULA_REP_LEGAL", png, LIDER, "cedula.pdf")
    expect(r.status).toBe(200)
    expect(r.body.tipoMime).toBe("image/png")
  })

  // Derived from R7.4
  it("reemplazar conserva la versión anterior y queda auditado", async () => {
    await cargar("RUT", pdfFicticio("primera"))
    const r = await cargar("RUT", pdfFicticio("segunda"))
    expect(r.body.version).toBe(2)
    const filas = await migrador.documentoLegal.findMany({
      where: { organizacionId: id, tipo: "RUT" },
      orderBy: { version: "asc" },
    })
    expect(filas.map((f) => f.version)).toEqual([1, 2])
    expect(filas[0].objetoVersion).not.toBe(filas[1].objetoVersion)
    const auditoria = await migrador.auditoriaCambio.findMany({
      where: { organizacionId: id, accion: "CARGAR_DOCUMENTO" },
      orderBy: { creadoEn: "asc" },
    })
    expect(auditoria).toHaveLength(2)
    expect(auditoria[1]).toMatchObject({
      usuarioId: "lider-a",
      entidad: "DocumentoLegal",
      valorAnterior: { tipo: "RUT", version: 1 },
      valorNuevo: { tipo: "RUT", version: 2 },
    })
  })

  // Derived from R7.3
  it("rechaza un archivo que no es PDF ni imagen, indicando los formatos", async () => {
    const zip = Buffer.from("PK\u0003\u0004 contenido comprimido")
    const r = await cargar("RUT", zip)
    expect(r.status).toBe(415)
    expect(r.body.message).toMatch(/PDF, JPG, PNG o WebP/)
    expect(await migrador.documentoLegal.count()).toBe(0)
  })

  // Derived from R7.9
  it("acepta un archivo de exactamente 10 MB", async () => {
    const r = await cargar("RUT", pdfFicticio("x", DIEZ_MB))
    expect(r.status).toBe(200)
    expect(r.body.tamanoBytes).toBe(DIEZ_MB)
  })

  // Derived from R7.9
  it.each([
    ["por un byte", DIEZ_MB + 1],
    ["por mucho: se corta sin leer el resto", 30 * 1024 * 1024],
  ])("rechaza un archivo que supera 10 MB %s", async (_caso, tamano) => {
    const r = await cargar("RUT", pdfFicticio("x", tamano))
    expect(r.status).toBe(413)
    expect(r.body.message).toMatch(/tamaño máximo permitido de 10 MB/)
    expect(await migrador.documentoLegal.count()).toBe(0)
  })

  it("exige el archivo y un tipo de documento conocido", async () => {
    const sinArchivo = await http().put(ruta("/RUT")).set(LIDER)
    expect(sinArchivo.status).toBe(400)
    expect(sinArchivo.body.errores).toEqual([
      { campo: "archivo", mensajes: ["El archivo es obligatorio"] },
    ])
    const tipo = await cargar("PASAPORTE", pdfFicticio("x"))
    expect(tipo.status).toBe(400)
  })

  // design.md § Contratos: PUT .../documentos/:tipo → 409 En validación
  it("no permite cambiar documentos mientras está En validación", async () => {
    await cargar("RUT", pdfFicticio("rut"))
    await migrador.organizacion.update({
      where: { id },
      data: { estado: "EN_VALIDACION", motivoDevolucion: null },
    })
    const r = await cargar("RUT", pdfFicticio("otro"))
    expect(r.status).toBe(409)
  })

  it("el Administrador no carga documentos", async () => {
    const r = await cargar("RUT", pdfFicticio("rut"), ADMIN)
    expect(r.status).toBe(403)
  })

  // Derived from R7.7, R6.1
  it("otro Líder SST no ve, no carga ni obtiene URLs: 404", async () => {
    await cargar("RUT", pdfFicticio("rut"))
    expect((await listar(OTRO_LIDER)).status).toBe(404)
    expect((await cargar("RUT", pdfFicticio("x"), OTRO_LIDER)).status).toBe(404)
    expect((await url("RUT", OTRO_LIDER)).status).toBe(404)
    expect((await listar(LIDER, "no-es-uuid")).status).toBe(404)
    expect(await migrador.documentoLegal.count()).toBe(1)
  })

  // Derived from R7.6, R7.7
  it("la URL firmada entrega la versión vigente al Líder y al Administrador", async () => {
    await cargar("RUT", pdfFicticio("primera"))
    await cargar("RUT", pdfFicticio("vigente"))
    for (const quien of [LIDER, ADMIN]) {
      const r = await url("RUT", quien)
      expect(r.status).toBe(200)
      expect(new URL(r.body.url).searchParams.get("X-Amz-Expires")).toBe("300")
      const archivo = await fetch(r.body.url)
      expect(await archivo.text()).toContain("vigente")
    }
  })

  it("responde 404 si el tipo pedido aún no tiene documento", async () => {
    expect((await url("CAMARA_COMERCIO")).status).toBe(404)
  })

  // Derived from R7.6
  it("el Administrador lista los documentos de una organización En validación", async () => {
    await cargar("RUT", pdfFicticio("rut"))
    await migrador.organizacion.update({
      where: { id },
      data: { estado: "EN_VALIDACION", motivoDevolucion: null },
    })
    const r = await listar(ADMIN)
    expect(r.status).toBe(200)
    expect(r.body.documentos[0].vigente).toMatchObject({ version: 1 })
  })
})
