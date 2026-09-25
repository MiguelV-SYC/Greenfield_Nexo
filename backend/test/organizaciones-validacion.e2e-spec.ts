import type { INestApplication } from "@nestjs/common"
import request from "supertest"
import type { App } from "supertest/types"

import type { PrismaClient } from "@/generated/prisma/client"
import {
  clienteMigrador,
  limpiarBase,
  sembrarCatalogoMinimo,
} from "./utilidades/bd"
import { crearAplicacion, registroValido } from "./utilidades/fabricas"

const ADMIN = { "x-usuario-mock": "admin-1;admin" }
const LIDER = { "x-usuario-mock": "lider-a" }

// NIT con DV válido (DIAN, Ecopetrol, Bancolombia)
const NITS: [string, string][] = [
  ["800197268", "4"],
  ["899999068", "1"],
  ["890903938", "8"],
]

describe("Validación del Administrador (T15)", () => {
  let app: INestApplication<App>
  let migrador: PrismaClient
  let ids: string[] = []

  const http = () => request(app.getHttpServer())

  beforeAll(async () => {
    migrador = clienteMigrador()
    app = await crearAplicacion()
  })

  beforeEach(async () => {
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
    ids = []
    for (const [nit, dv] of NITS) {
      const r = await http()
        .post("/api/v1/organizaciones")
        .set(LIDER)
        .send(
          registroValido({
            nit,
            digitoVerificacion: dv,
            razonSocial: `Org ${nit}`,
          }),
        )
      ids.push(r.body.id)
    }
  })

  afterAll(async () => {
    await app.close()
    await limpiarBase(migrador)
    await migrador.$disconnect()
  })

  const estadoDe = async (id: string) =>
    (await migrador.organizacion.findUniqueOrThrow({ where: { id } })).estado

  // Derived from R5.8
  it("lista la cola en validación, de la más antigua a la más reciente", async () => {
    await migrador.organizacion.update({
      where: { id: ids[1] },
      data: { estado: "APROBADA" },
    })
    const r = await http()
      .get("/api/v1/admin/organizaciones/validacion")
      .set(ADMIN)
    expect(r.status).toBe(200)
    expect(r.body.map((o: { id: string }) => o.id)).toEqual([ids[0], ids[2]])
    expect(r.body[0]).toMatchObject({
      nit: "800197268",
      estandaresAplicables: 21,
      sedes: 1,
    })
  })

  // Derived from R4.3
  it("aprueba una organización en validación", async () => {
    const r = await http()
      .post(`/api/v1/admin/organizaciones/${ids[0]}/aprobacion`)
      .set(ADMIN)
    expect(r.status).toBe(200)
    expect(r.body.estado).toBe("APROBADA")
    await expect(estadoDe(ids[0])).resolves.toBe("APROBADA")
  })

  // Derived from R4.4
  it.each([undefined, "", "   "])(
    "exige un motivo no vacío para devolver (%p)",
    async (motivo) => {
      const r = await http()
        .post(`/api/v1/admin/organizaciones/${ids[0]}/devolucion`)
        .set(ADMIN)
        .send({ motivo })
      expect(r.status).toBe(400)
      expect(r.body.errores.map((e: { campo: string }) => e.campo)).toEqual([
        "motivo",
      ])
      await expect(estadoDe(ids[0])).resolves.toBe("EN_VALIDACION")
    },
  )

  // Derived from R4.5
  it("devuelve con motivo y lo conserva", async () => {
    const r = await http()
      .post(`/api/v1/admin/organizaciones/${ids[0]}/devolucion`)
      .set(ADMIN)
      .send({ motivo: "  El RUT no está actualizado  " })
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({
      estado: "DEVUELTA",
      motivoDevolucion: "El RUT no está actualizado",
    })
  })

  // Derived from R6.3 y R6.4
  it("audita la aprobación y la devolución con el motivo", async () => {
    await http()
      .post(`/api/v1/admin/organizaciones/${ids[0]}/aprobacion`)
      .set(ADMIN)
    await http()
      .post(`/api/v1/admin/organizaciones/${ids[1]}/devolucion`)
      .set(ADMIN)
      .send({ motivo: "Falta la cámara de comercio" })
    const registros = await migrador.auditoriaCambio.findMany({
      where: { accion: { in: ["APROBAR", "DEVOLVER"] } },
      orderBy: { creadoEn: "asc" },
    })
    expect(registros).toEqual([
      expect.objectContaining({
        organizacionId: ids[0],
        usuarioId: "admin-1",
        accion: "APROBAR",
        valorAnterior: { estado: "EN_VALIDACION" },
        valorNuevo: { estado: "APROBADA" },
      }),
      expect.objectContaining({
        organizacionId: ids[1],
        accion: "DEVOLVER",
        motivo: "Falta la cámara de comercio",
      }),
    ])
  })

  // Derived from R4.9
  it("un Líder SST no puede ver la cola, aprobar ni devolver", async () => {
    const cola = await http()
      .get("/api/v1/admin/organizaciones/validacion")
      .set(LIDER)
    const aprobar = await http()
      .post(`/api/v1/admin/organizaciones/${ids[0]}/aprobacion`)
      .set(LIDER)
    const devolver = await http()
      .post(`/api/v1/admin/organizaciones/${ids[0]}/devolucion`)
      .set(LIDER)
      .send({ motivo: "x" })
    expect([cola.status, aprobar.status, devolver.status]).toEqual([
      403, 403, 403,
    ])
    await expect(estadoDe(ids[0])).resolves.toBe("EN_VALIDACION")
  })

  // Derived from R4.10
  it("no aprueba ni devuelve lo que no está en validación", async () => {
    await http()
      .post(`/api/v1/admin/organizaciones/${ids[0]}/aprobacion`)
      .set(ADMIN)
    const otraVez = await http()
      .post(`/api/v1/admin/organizaciones/${ids[0]}/aprobacion`)
      .set(ADMIN)
    const devolver = await http()
      .post(`/api/v1/admin/organizaciones/${ids[0]}/devolucion`)
      .set(ADMIN)
      .send({ motivo: "Tarde" })
    expect([otraVez.status, devolver.status]).toEqual([409, 409])
    await expect(estadoDe(ids[0])).resolves.toBe("APROBADA")
  })

  it("responde 404 para una organización que no existe", async () => {
    const r = await http()
      .post(
        "/api/v1/admin/organizaciones/00000000-0000-4000-8000-000000000999/aprobacion",
      )
      .set(ADMIN)
    expect(r.status).toBe(404)
  })
})
