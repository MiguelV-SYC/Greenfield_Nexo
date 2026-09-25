// Derived from R4.9 y R6.2 (autenticación simulada y rol de Administrador)
import { ForbiddenException, UnauthorizedException } from "@nestjs/common"
import type { ExecutionContext } from "@nestjs/common"

import { AutenticacionGuard, SoloAdministradorGuard } from "./guards"
import type { UsuarioActual } from "./usuario-actual"

type Peticion = {
  headers: Record<string, string | undefined>
  usuarioActual?: UsuarioActual
}

function contextoCon(peticion: Peticion): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => peticion }),
  } as unknown as ExecutionContext
}

describe("AutenticacionGuard en modo mock", () => {
  const guard = new AutenticacionGuard("mock")

  it("deja pasar y fija el usuario actual con una cabecera válida", () => {
    const peticion: Peticion = { headers: { "x-usuario-mock": "lider-a" } }
    expect(guard.canActivate(contextoCon(peticion))).toBe(true)
    expect(peticion.usuarioActual).toEqual({ id: "lider-a", esAdmin: false })
  })

  it("responde 401 sin cabecera", () => {
    expect(() => guard.canActivate(contextoCon({ headers: {} }))).toThrow(
      UnauthorizedException,
    )
  })
})

describe("AutenticacionGuard sin modo de autenticación", () => {
  it("rechaza toda petición hasta que exista auth (D1)", () => {
    const guard = new AutenticacionGuard("ninguno")
    const peticion: Peticion = { headers: { "x-usuario-mock": "lider-a" } }
    expect(() => guard.canActivate(contextoCon(peticion))).toThrow(
      UnauthorizedException,
    )
  })
})

describe("SoloAdministradorGuard", () => {
  const guard = new SoloAdministradorGuard()

  // Derived from R4.9
  it("responde 403 a un usuario que no es Administrador", () => {
    const peticion: Peticion = {
      headers: {},
      usuarioActual: { id: "lider-a", esAdmin: false },
    }
    expect(() => guard.canActivate(contextoCon(peticion))).toThrow(
      ForbiddenException,
    )
  })

  it("deja pasar al Administrador", () => {
    const peticion: Peticion = {
      headers: {},
      usuarioActual: { id: "admin-1", esAdmin: true },
    }
    expect(guard.canActivate(contextoCon(peticion))).toBe(true)
  })
})
