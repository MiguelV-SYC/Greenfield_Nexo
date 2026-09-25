import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import type { App } from "supertest/types"

import { AppModule } from "@/app.module"
import { configurarAplicacion } from "@/app.setup"

describe("POST /estandares-aplicables/calculo (T11)", () => {
  let app: INestApplication<App>

  beforeAll(async () => {
    process.env.AUTH_MODO = "mock"
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = modulo.createNestApplication({ bufferLogs: true })
    configurarAplicacion(app)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  const calcular = (cuerpo: unknown) =>
    request(app.getHttpServer())
      .post("/api/v1/estandares-aplicables/calculo")
      .set("x-usuario-mock", "lider-a")
      .send(cuerpo as object)

  // Derived from R3.6 y R3.2
  it("devuelve estándares, riesgo máximo, total y regla sin persistir", async () => {
    const respuesta = await calcular({
      sedes: [
        { claseRiesgo: "II", trabajadores: 20 },
        { claseRiesgo: "IV", trabajadores: 5 },
      ],
    })
    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toMatchObject({
      estandares: 62,
      riesgoMaximo: "IV",
      totalTrabajadores: 25,
    })
    expect(respuesta.body.regla).toMatch(/riesgo IV/)
  })

  // Derived from R2.1
  it("responde 400 con el campo cuando no hay sedes", async () => {
    const respuesta = await calcular({ sedes: [] })
    expect(respuesta.status).toBe(400)
    expect(
      respuesta.body.errores.map((e: { campo: string }) => e.campo),
    ).toEqual(["sedes"])
  })

  // Derived from R2.3 y R2.4
  it("indica el campo exacto de la sede inválida", async () => {
    const respuesta = await calcular({
      sedes: [
        { claseRiesgo: "III", trabajadores: 4 },
        { claseRiesgo: "VI", trabajadores: 0 },
      ],
    })
    expect(respuesta.status).toBe(400)
    const campos = respuesta.body.errores.map((e: { campo: string }) => e.campo)
    expect(campos).toEqual(["sedes.1.claseRiesgo", "sedes.1.trabajadores"])
  })

  it("rechaza campos que no están en el contrato", async () => {
    const respuesta = await calcular({
      sedes: [{ claseRiesgo: "I", trabajadores: 1 }],
      extra: 1,
    })
    expect(respuesta.status).toBe(400)
  })
})
