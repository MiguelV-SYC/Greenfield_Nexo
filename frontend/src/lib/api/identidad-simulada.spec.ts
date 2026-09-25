// Derived from D1 (identidad simulada en el frontend, DEC-11)
import {
  esAdministrador,
  guardarIdentidad,
  IDENTIDAD_POR_DEFECTO,
  identidadDesdeUsuario,
  leerIdentidad,
} from "./identidad-simulada"

describe("identidad simulada", () => {
  beforeEach(() => window.localStorage.clear())

  it("convierte el usuario del login en un id seguro", () => {
    expect(identidadDesdeUsuario("  Kevin Arley ")).toBe("kevin-arley")
  })

  it("marca como Administrador a los usuarios admin", () => {
    expect(identidadDesdeUsuario("admin")).toBe("admin;admin")
    expect(esAdministrador("admin;admin")).toBe(true)
    expect(esAdministrador("kevin")).toBe(false)
  })

  it("usa la identidad por defecto con un usuario vacío", () => {
    expect(identidadDesdeUsuario("   ")).toBe(IDENTIDAD_POR_DEFECTO)
  })

  it("recuerda la identidad entre páginas", () => {
    expect(leerIdentidad()).toBe(IDENTIDAD_POR_DEFECTO)
    guardarIdentidad("lider-a")
    expect(leerIdentidad()).toBe("lider-a")
  })
})
