// Derived from T3 (scaffolding del backend; sin R*.*)
import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import type { App } from "supertest/types"

import { AppModule } from "@/app.module"
import { configurarAplicacion } from "@/app.setup"

describe("Arranque del backend", () => {
  let app: INestApplication<App>

  beforeAll(async () => {
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

  it("publica el OpenAPI en /api/docs-json", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/api/docs-json")
      .expect(200)
    expect(respuesta.body.info.title).toBe("Nexo API")
  })

  it("responde 404 fuera del prefijo /api/v1", async () => {
    await request(app.getHttpServer()).get("/organizaciones").expect(404)
  })
})
