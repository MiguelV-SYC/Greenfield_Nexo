import { join } from "node:path"

import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import type { App } from "supertest/types"

import { AppModule } from "@/app.module"
import { configurarAplicacion } from "@/app.setup"
import type { PrismaClient } from "@/generated/prisma/client"
import { leerCatalogos } from "@/organizaciones/catalogos/leer-catalogos"
import { sembrarCatalogos } from "@/organizaciones/catalogos/sembrador"
import { clienteMigrador, limpiarBase } from "./utilidades/bd"

const LIDER = { "x-usuario-mock": "lider-a" }

describe("Catálogos DIVIPOLA, CIIU y ARL (T9)", () => {
  let migrador: PrismaClient
  let app: INestApplication<App>

  beforeAll(async () => {
    process.env.AUTH_MODO = "mock"
    migrador = clienteMigrador()
    await limpiarBase(migrador)
    const catalogos = leerCatalogos(
      join(__dirname, "..", "prisma", "catalogos"),
    )
    await sembrarCatalogos(migrador, catalogos)
    // Idempotente: una segunda siembra no duplica ni falla (DEC-7).
    await sembrarCatalogos(migrador, catalogos)
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = modulo.createNestApplication({ bufferLogs: true })
    configurarAplicacion(app)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await limpiarBase(migrador)
    await migrador.$disconnect()
  })

  const get = (ruta: string) =>
    request(app.getHttpServer()).get(`/api/v1${ruta}`).set(LIDER)

  // Derived from D3 (DIVIPOLA oficial con fecha de corte, DEC-7)
  it("registra la versión y la fecha de corte de cada catálogo", async () => {
    const versiones = await migrador.catalogoVersion.findMany({
      orderBy: { catalogo: "asc" },
    })
    expect(versiones.map((v) => v.catalogo)).toEqual([
      "arl",
      "ciiu",
      "divipola",
    ])
    expect(versiones[2].fechaCorte.toISOString().slice(0, 10)).toBe(
      "2025-01-24",
    )
    await expect(migrador.municipio.count()).resolves.toBe(1122)
  })

  // Derived from R2.5
  it("lista los 33 departamentos", async () => {
    const respuesta = await get("/catalogos/departamentos")
    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toHaveLength(33)
    expect(respuesta.body).toContainEqual({ codigo: "68", nombre: "SANTANDER" })
  })

  // Derived from R2.5 y R2.6
  it("lista solo los municipios del departamento", async () => {
    const respuesta = await get("/catalogos/departamentos/68/municipios")
    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toContainEqual({
      codigo: "68679",
      nombre: "SAN GIL",
    })
    const codigos: string[] = respuesta.body.map(
      (m: { codigo: string }) => m.codigo,
    )
    expect(codigos.every((c) => c.startsWith("68"))).toBe(true)
  })

  // Derived from R2.5
  it("responde 404 para un departamento inexistente", async () => {
    const respuesta = await get("/catalogos/departamentos/00/municipios")
    expect(respuesta.status).toBe(404)
  })

  // Derived from R2.7
  it("busca actividades CIIU por código", async () => {
    const respuesta = await get("/catalogos/ciiu?q=6201")
    expect(respuesta.body.map((a: { codigo: string }) => a.codigo)).toEqual([
      "6201",
    ])
  })

  // Derived from R2.7
  it("busca actividades CIIU por palabra sin distinguir mayúsculas", async () => {
    const respuesta = await get("/catalogos/ciiu?q=CONSTRUCCI")
    const codigos = respuesta.body.map((a: { codigo: string }) => a.codigo)
    expect(codigos).toEqual(expect.arrayContaining(["4100", "4210"]))
    expect(respuesta.body.length).toBeLessThanOrEqual(20)
  })

  // Derived from R2.7
  it("no devuelve resultados CIIU con una búsqueda vacía", async () => {
    const respuesta = await get("/catalogos/ciiu?q=%20")
    expect(respuesta.body).toEqual([])
  })

  // Derived from R1.9
  it("lista las ARL", async () => {
    const respuesta = await get("/catalogos/arl")
    expect(respuesta.body).toHaveLength(6)
    expect(respuesta.body).toContainEqual({
      codigo: "aurora",
      nombre: "Aurora",
    })
  })

  it("exige identidad", async () => {
    const respuesta = await request(app.getHttpServer()).get(
      "/api/v1/catalogos/arl",
    )
    expect(respuesta.status).toBe(401)
  })
})
