// Derived from D1 (identidad simulada, DEC-11)
import { leerIdentidadSimulada } from "./identidad-simulada"

describe("leerIdentidadSimulada", () => {
  it("lee un Líder SST", () => {
    expect(leerIdentidadSimulada("lider-a")).toEqual({
      id: "lider-a",
      esAdmin: false,
    })
  })

  it("lee un Administrador con el sufijo ;admin", () => {
    expect(leerIdentidadSimulada("admin-1;admin")).toEqual({
      id: "admin-1",
      esAdmin: true,
    })
  })

  it.each([
    undefined,
    "",
    "   ",
    "con espacios",
    "x;root",
    "a".repeat(65),
    "lider;admin;otra",
  ])("rechaza la cabecera %p", (valor) => {
    expect(leerIdentidadSimulada(valor)).toBeNull()
  })
})
