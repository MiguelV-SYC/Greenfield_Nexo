import {
  Controller,
  Get,
  type INestApplication,
  UseGuards,
} from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import type { App } from "supertest/types"

import { AuthModule } from "@/common/auth/auth.module"
import { SoloAdministradorGuard } from "@/common/auth/guards"
import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { Usuario } from "@/common/auth/usuario.decorator"

@Controller("prueba")
class ControllerDePrueba {
  @Get("yo")
  yo(@Usuario() usuario: UsuarioActual): UsuarioActual {
    return usuario
  }

  @Get("admin")
  @UseGuards(SoloAdministradorGuard)
  admin(): { ok: true } {
    return { ok: true }
  }
}

describe("Autenticación simulada por HTTP (D1, DEC-11)", () => {
  let app: INestApplication<App>
  const modoOriginal = process.env.AUTH_MODO

  beforeAll(async () => {
    process.env.AUTH_MODO = "mock"
    const modulo = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [ControllerDePrueba],
    }).compile()
    app = modulo.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    process.env.AUTH_MODO = modoOriginal
    await app.close()
  })

  it("responde 401 sin identidad", async () => {
    await request(app.getHttpServer()).get("/prueba/yo").expect(401)
  })

  it("entrega el usuario actual al controller", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/prueba/yo")
      .set("x-usuario-mock", "lider-a")
      .expect(200)
    expect(respuesta.body).toEqual({ id: "lider-a", esAdmin: false })
  })

  // Derived from R4.9
  it("responde 403 a un Líder SST en una ruta de Administrador", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/prueba/admin")
      .set("x-usuario-mock", "lider-a")
    expect(respuesta.status).toBe(403)
  })

  // Derived from R6.2
  it("deja pasar al Administrador", async () => {
    const respuesta = await request(app.getHttpServer())
      .get("/prueba/admin")
      .set("x-usuario-mock", "admin-1;admin")
    expect(respuesta.status).toBe(200)
  })
})
