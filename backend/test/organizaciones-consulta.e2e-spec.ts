import type { INestApplication } from "@nestjs/common"
import request from "supertest"
import type { App } from "supertest/types"

import type { PrismaClient } from "@/generated/prisma/client"
import { OrganizacionesService } from "@/organizaciones/organizaciones.service"
import {
  clienteMigrador,
  limpiarBase,
  sembrarCatalogoMinimo,
} from "./utilidades/bd"
import { crearAplicacion, registroValido } from "./utilidades/fabricas"

interface Tarjeta {
  id: string
  nombreVisible: string
  estado: string
  puedeIngresar: boolean
  motivoDevolucion: string | null
  porcentajeImplementacion: number | null
  porcentajeCumplimiento: number | null
  arl: { codigo: string; nombre: string } | null
}

describe("GET /organizaciones y /organizaciones/:id (T14)", () => {
  let app: INestApplication<App>
  let migrador: PrismaClient
  const ids: Record<string, string> = {}

  const como = (usuario: string) => ({ "x-usuario-mock": usuario })

  beforeAll(async () => {
    migrador = clienteMigrador()
    await limpiarBase(migrador)
    await sembrarCatalogoMinimo(migrador)
    app = await crearAplicacion()
    const registrar = async (
      clave: string,
      usuario: string,
      cuerpo: object,
    ) => {
      const r = await request(app.getHttpServer())
        .post("/api/v1/organizaciones")
        .set(como(usuario))
        .send(cuerpo)
      ids[clave] = r.body.id
    }
    await registrar("aprobada", "lider-a", registroValido())
    await registrar(
      "devuelta",
      "lider-a",
      registroValido({
        nit: "899999068",
        digitoVerificacion: "1",
        nombreComercial: undefined,
        razonSocial: "Ecopetrol S.A.",
      }),
    )
    await registrar(
      "ajena",
      "lider-b",
      registroValido({ nit: "890903938", digitoVerificacion: "8" }),
    )
    await migrador.organizacion.update({
      where: { id: ids.aprobada },
      data: { estado: "APROBADA" },
    })
    await migrador.organizacion.update({
      where: { id: ids.devuelta },
      data: {
        estado: "DEVUELTA",
        motivoDevolucion: "Falta el RUT actualizado",
      },
    })
  })

  afterAll(async () => {
    await app.close()
    await limpiarBase(migrador)
    await migrador.$disconnect()
  })

  const listar = async (usuario: string) => {
    const r = await request(app.getHttpServer())
      .get("/api/v1/organizaciones")
      .set(como(usuario))
    return r.body as { total: number; organizaciones: Tarjeta[] }
  }
  const tarjeta = async (usuario: string, id: string) =>
    (await listar(usuario)).organizaciones.find((o) => o.id === id) as Tarjeta

  // Derived from R5.1 y R5.7
  it("lista todas las organizaciones del Líder SST, en cualquier estado, con el total", async () => {
    const lista = await listar("lider-a")
    expect(lista.total).toBe(2)
    expect(lista.organizaciones.map((o) => o.id).sort()).toEqual(
      [ids.aprobada, ids.devuelta].sort(),
    )
  })

  // Derived from R5.2 y R1.8
  it("muestra nombre, estado, riesgo, ARL y trabajadores", async () => {
    expect(await tarjeta("lider-a", ids.aprobada)).toMatchObject({
      nombreVisible: "DIAN",
      estado: "APROBADA",
      riesgoMaximo: "II",
      totalTrabajadores: 12,
      arl: { codigo: "aurora", nombre: "Aurora" },
    })
    expect((await tarjeta("lider-a", ids.devuelta)).nombreVisible).toBe(
      "Ecopetrol S.A.",
    )
  })

  // Derived from R5.3
  it("deja los porcentajes sin evaluar mientras no exista cumplimiento-normativo (D2)", async () => {
    const t = await tarjeta("lider-a", ids.aprobada)
    expect(t.porcentajeImplementacion).toBeNull()
    expect(t.porcentajeCumplimiento).toBeNull()
  })

  // Derived from R5.4
  it("permite ingresar solo a organizaciones aprobadas", async () => {
    expect((await tarjeta("lider-a", ids.aprobada)).puedeIngresar).toBe(true)
    expect((await tarjeta("lider-a", ids.devuelta)).puedeIngresar).toBe(false)
    expect((await tarjeta("lider-b", ids.ajena)).puedeIngresar).toBe(false)
  })

  // Derived from R5.5
  it("muestra el motivo solo en la organización devuelta", async () => {
    expect((await tarjeta("lider-a", ids.devuelta)).motivoDevolucion).toBe(
      "Falta el RUT actualizado",
    )
    expect((await tarjeta("lider-a", ids.aprobada)).motivoDevolucion).toBeNull()
  })

  it("un usuario sin organizaciones recibe una lista vacía", async () => {
    await expect(listar("sin-organizaciones")).resolves.toEqual({
      total: 0,
      organizaciones: [],
    })
  })

  it("el Administrador no ve en su lista organizaciones de las que no es miembro", async () => {
    await expect(listar("admin-1;admin")).resolves.toEqual({
      total: 0,
      organizaciones: [],
    })
  })

  // Derived from R5.9
  it("entrega el detalle con identificación legal, sedes y estándares", async () => {
    const r = await request(app.getHttpServer())
      .get(`/api/v1/organizaciones/${ids.aprobada}`)
      .set(como("lider-a"))
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({ nit: "800197268", estandaresAplicables: 21 })
    expect(r.body.sedes).toHaveLength(1)
  })

  // Derived from R6.1
  it("responde 404 al pedir una organización ajena", async () => {
    const r = await request(app.getHttpServer())
      .get(`/api/v1/organizaciones/${ids.ajena}`)
      .set(como("lider-a"))
    expect(r.status).toBe(404)
  })

  // Derived from R6.2
  it("el Administrador consulta cualquier organización", async () => {
    const r = await request(app.getHttpServer())
      .get(`/api/v1/organizaciones/${ids.ajena}`)
      .set(como("admin-1;admin"))
    expect(r.status).toBe(200)
  })

  // Derived from R5.4 (DEC-12: lo usará auth al cambiar de organización)
  it("puedeIngresar solo es verdadero para un miembro de una organización aprobada", async () => {
    const servicio = app.get(OrganizacionesService)
    await expect(servicio.puedeIngresar("lider-a", ids.aprobada)).resolves.toBe(
      true,
    )
    await expect(servicio.puedeIngresar("lider-a", ids.devuelta)).resolves.toBe(
      false,
    )
    await expect(servicio.puedeIngresar("lider-b", ids.aprobada)).resolves.toBe(
      false,
    )
    await expect(servicio.puedeIngresar("lider-a", "no-es-uuid")).resolves.toBe(
      false,
    )
  })

  it("responde 404 con un id que no es un UUID", async () => {
    const r = await request(app.getHttpServer())
      .get("/api/v1/organizaciones/no-es-uuid")
      .set(como("lider-a"))
    expect(r.status).toBe(404)
  })
})
