import {
  calcularDigitoVerificacion,
  esDigitoVerificacionValido,
} from "./digito-verificacion"

describe("dígito de verificación del NIT (DIAN, módulo 11)", () => {
  // Derived from R1.6 — NIT públicos con su DV conocido
  it.each([
    ["800197268", "4"], // DIAN
    ["899999068", "1"], // Ecopetrol
    ["890903938", "8"], // Bancolombia
  ])("calcula el DV de %s", (nit, dv) => {
    expect(calcularDigitoVerificacion(nit)).toBe(dv)
  })

  // Derived from R1.6
  it("acepta el DV correcto y rechaza uno incorrecto", () => {
    expect(esDigitoVerificacionValido("800197268", "4")).toBe(true)
    expect(esDigitoVerificacionValido("800197268", "5")).toBe(false)
  })

  // Derived from R1.5
  it.each(["", "80019726A", "800-197268", " 800197268", "1234567890123456"])(
    "no calcula el DV de un NIT inválido: %p",
    (nit) => {
      expect(() => calcularDigitoVerificacion(nit)).toThrow()
      expect(esDigitoVerificacionValido(nit, "4")).toBe(false)
    },
  )

  it("rechaza un DV que no es un único dígito", () => {
    expect(esDigitoVerificacionValido("800197268", "44")).toBe(false)
    expect(esDigitoVerificacionValido("800197268", "")).toBe(false)
  })
})
