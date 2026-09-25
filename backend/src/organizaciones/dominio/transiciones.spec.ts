import {
  AccionNoPermitidaError,
  aplicarTransicion,
  puedeModificarNit,
  TransicionInvalidaError,
} from "./transiciones"

describe("transiciones de estado de una organización", () => {
  // Derived from R4.3
  it("el Administrador aprueba una organización en validación", () => {
    expect(aplicarTransicion("EN_VALIDACION", "APROBAR", "ADMINISTRADOR")).toBe(
      "APROBADA",
    )
  })

  // Derived from R4.5
  it("el Administrador devuelve una organización en validación", () => {
    expect(
      aplicarTransicion("EN_VALIDACION", "DEVOLVER", "ADMINISTRADOR"),
    ).toBe("DEVUELTA")
  })

  // Derived from R4.6
  it("el Líder SST corrige una organización devuelta sin cambiar su estado", () => {
    expect(aplicarTransicion("DEVUELTA", "CORREGIR", "LIDER_SST")).toBe(
      "DEVUELTA",
    )
  })

  // Derived from R4.7
  it("el Líder SST reenvía una organización devuelta", () => {
    expect(aplicarTransicion("DEVUELTA", "REENVIAR", "LIDER_SST")).toBe(
      "EN_VALIDACION",
    )
  })

  // Derived from R8.1
  it("el Líder SST edita una organización aprobada", () => {
    expect(aplicarTransicion("APROBADA", "EDITAR", "LIDER_SST")).toBe(
      "APROBADA",
    )
  })

  // Derived from R4.9
  it.each(["APROBAR", "DEVOLVER"] as const)(
    "un Líder SST no puede %s",
    (accion) => {
      expect(() =>
        aplicarTransicion("EN_VALIDACION", accion, "LIDER_SST"),
      ).toThrow(AccionNoPermitidaError)
    },
  )

  // Derived from R4.8
  it("nadie corrige una organización en validación", () => {
    expect(() =>
      aplicarTransicion("EN_VALIDACION", "CORREGIR", "LIDER_SST"),
    ).toThrow(TransicionInvalidaError)
  })

  // Derived from R4.10
  it.each([
    ["APROBADA", "APROBAR"],
    ["DEVUELTA", "APROBAR"],
    ["APROBADA", "DEVOLVER"],
    ["DEVUELTA", "DEVOLVER"],
  ] as const)("no se puede %2$s una organización %1$s", (estado, accion) => {
    expect(() => aplicarTransicion(estado, accion, "ADMINISTRADOR")).toThrow(
      TransicionInvalidaError,
    )
  })

  it("no se reenvía lo que no está devuelto", () => {
    expect(() =>
      aplicarTransicion("APROBADA", "REENVIAR", "LIDER_SST"),
    ).toThrow(TransicionInvalidaError)
  })

  // Derived from R8.6
  it("el NIT solo se modifica mientras la organización está devuelta", () => {
    expect(puedeModificarNit("DEVUELTA")).toBe(true)
    expect(puedeModificarNit("APROBADA")).toBe(false)
    expect(puedeModificarNit("EN_VALIDACION")).toBe(false)
  })
})
