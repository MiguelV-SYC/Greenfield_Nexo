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

const LIDER = { "x-usuario-mock": "lider-a" }
const OTRO_LIDER = { "x-usuario-mock": "lider-b" }
const ADMIN = { "x-usuario-mock": "admin-1;admin" }

describe("Corrección y reenvío (T16)", () => {
  let app: INestApplication<App>
  let migrador: PrismaClient
  let id: string

  const http = () => request(app.getHttpServer())
  const devolver = (organizacion: string, motivo = "Falta el RUT") =>
    http()
      .post(`/api/v1/admin/organizaciones/${organizacion}/devolucion`)
      .set(ADMIN)
      .send({ motivo })
  const corregir = (cuerpo: object, quien = LIDER) =>
    http().put(`/api/v1/organizaciones/${id}`).set(quien).send(cuerpo)
  const reenviar = (quien = LIDER) =>
    http().post(`/api/v1/organizaciones/${id}/reenvio`).set(quien)

  beforeAll(async () => {
    migrador = clienteMigrador()
    app = await crearAplicacion()
  })

  beforeEach(async () => {
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
    const r = await http()
      .post("/api/v1/organizaciones")
      .set(LIDER)
      .send(registroValido())
    id = r.body.id
    await devolver(id)
  })

  afterAll(async () => {
    await app.close()
    await limpiarBase(migrador)
    await migrador.$disconnect()
  })

  const correccion = () =>
    registroValido({
      razonSocial: "Ecopetrol S.A.",
      nit: "899999068",
      digitoVerificacion: "1",
      sedes: [
        sedeValida({ trabajadores: 40 }),
        sedeValida({ nombre: "Bodega", trabajadores: 20 }),
      ],
    })

  // Derived from R4.6, R8.6 y R3.5
  it("corrige datos, NIT y sedes de una organización devuelta", async () => {
    const r = await corregir(correccion())
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({
      estado: "DEVUELTA",
      razonSocial: "Ecopetrol S.A.",
      nit: "899999068",
      totalTrabajadores: 60,
      estandaresAplicables: 62,
      motivoDevolucion: "Falta el RUT",
    })
    expect(
      r.body.sedes.map((s: { nombre: string }) => s.nombre).sort(),
    ).toEqual(["Bodega", "Oficina principal"])
    await expect(
      migrador.sede.count({ where: { organizacionId: id } }),
    ).resolves.toBe(2)
  })

  // Derived from R6.3
  it("audita la corrección con los valores anterior y nuevo", async () => {
    await corregir(correccion())
    const registro = await migrador.auditoriaCambio.findFirstOrThrow({
      where: { organizacionId: id, accion: "CORREGIR" },
    })
    expect(registro.valorAnterior).toMatchObject({ nit: "800197268" })
    expect(registro.valorNuevo).toMatchObject({ nit: "899999068" })
  })

  // Derived from R4.8
  it("no permite corregir mientras está en validación", async () => {
    await reenviar()
    const r = await corregir(correccion())
    expect(r.status).toBe(409)
    const actual = await migrador.organizacion.findUniqueOrThrow({
      where: { id },
    })
    expect(actual.nit).toBe("800197268")
  })

  it("no edita una organización aprobada hasta P3 (T26)", async () => {
    await migrador.organizacion.update({
      where: { id },
      data: { estado: "APROBADA" },
    })
    const r = await corregir(correccion())
    expect(r.status).toBe(409)
  })

  // Derived from R1.6
  it("valida la corrección igual que el registro", async () => {
    const r = await corregir(registroValido({ digitoVerificacion: "9" }))
    expect(r.status).toBe(400)
    expect(r.body.errores.map((e: { campo: string }) => e.campo)).toEqual([
      "digitoVerificacion",
    ])
  })

  // Derived from R1.7
  it("rechaza corregir al NIT de otra organización", async () => {
    await http()
      .post("/api/v1/organizaciones")
      .set(OTRO_LIDER)
      .send(registroValido({ nit: "890903938", digitoVerificacion: "8" }))
    const r = await corregir(
      registroValido({ nit: "890903938", digitoVerificacion: "8" }),
    )
    expect(r.status).toBe(409)
  })

  // Derived from R6.1
  it("otro Líder SST no puede corregir ni reenviar (404)", async () => {
    const r1 = await corregir(correccion(), OTRO_LIDER)
    const r2 = await reenviar(OTRO_LIDER)
    expect([r1.status, r2.status]).toEqual([404, 404])
  })

  // Derived from R4.6
  it("el Administrador no corrige ni reenvía por el Líder SST (403)", async () => {
    const r1 = await corregir(correccion(), ADMIN)
    const r2 = await reenviar(ADMIN)
    expect([r1.status, r2.status]).toEqual([403, 403])
  })

  // Derived from R4.7
  it("reenvía a validación con nueva fecha de envío y sin motivo", async () => {
    const antes = await migrador.organizacion.findUniqueOrThrow({
      where: { id },
    })
    const r = await reenviar()
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({
      estado: "EN_VALIDACION",
      motivoDevolucion: null,
    })
    expect(new Date(r.body.enviadaEn).getTime()).toBeGreaterThan(
      antes.enviadaEn.getTime(),
    )
    const cola = await http()
      .get("/api/v1/admin/organizaciones/validacion")
      .set(ADMIN)
    expect(cola.body.map((o: { id: string }) => o.id)).toEqual([id])
  })

  // Derived from R4.7 (sin límite de reenvíos)
  it("permite devolver y reenviar varias veces", async () => {
    await reenviar()
    await devolver(id, "Segunda devolución")
    const r = await reenviar()
    expect(r.status).toBe(200)
    const reenvios = await migrador.auditoriaCambio.count({
      where: { organizacionId: id, accion: "REENVIAR" },
    })
    expect(reenvios).toBe(2)
  })

  it("no reenvía lo que ya está en validación", async () => {
    await reenviar()
    const r = await reenviar()
    expect(r.status).toBe(409)
  })
})
