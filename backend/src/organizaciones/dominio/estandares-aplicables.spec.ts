import { calcularEstandaresAplicables } from "./estandares-aplicables"

const sede = (
  claseRiesgo: "I" | "II" | "III" | "IV" | "V",
  trabajadores: number,
) => ({ claseRiesgo, trabajadores })

describe("estándares mínimos aplicables (Res. 0312 de 2019)", () => {
  // Derived from R3.4
  it("asigna 7 con 10 o menos trabajadores y riesgo máximo I–III", () => {
    expect(calcularEstandaresAplicables([sede("III", 10)])).toMatchObject({
      estandares: 7,
      riesgoMaximo: "III",
      totalTrabajadores: 10,
    })
  })

  // Derived from R3.3 (borde 10/11)
  it("asigna 21 desde 11 trabajadores con riesgo máximo I–III", () => {
    const resultado = calcularEstandaresAplicables([
      sede("I", 6),
      sede("II", 5),
    ])
    expect(resultado.estandares).toBe(21)
  })

  // Derived from R3.3 (borde 50/51)
  it("asigna 21 con exactamente 50 trabajadores y riesgo I–III", () => {
    expect(calcularEstandaresAplicables([sede("III", 50)]).estandares).toBe(21)
  })

  // Derived from R3.1 (borde 50/51)
  it("asigna 62 con más de 50 trabajadores, cualquier riesgo", () => {
    const resultado = calcularEstandaresAplicables([
      sede("I", 50),
      sede("I", 1),
    ])
    expect(resultado.estandares).toBe(62)
  })

  // Derived from R3.2 (corrige el mockup V5, DEC-10)
  it.each(["IV", "V"] as const)(
    "asigna 62 con riesgo máximo %s aunque haya 50 o menos trabajadores",
    (riesgo) => {
      const resultado = calcularEstandaresAplicables([
        sede("I", 3),
        sede(riesgo, 1),
      ])
      expect(resultado).toMatchObject({
        estandares: 62,
        riesgoMaximo: riesgo,
        totalTrabajadores: 4,
      })
    },
  )

  // Derived from R3.6
  it("explica la regla aplicada", () => {
    expect(calcularEstandaresAplicables([sede("II", 3)]).regla).toMatch(
      /10 o menos/,
    )
    expect(calcularEstandaresAplicables([sede("V", 3)]).regla).toMatch(
      /riesgo V/,
    )
  })

  // Derived from R2.1 y R2.4
  it("rechaza una lista de sedes vacía o con trabajadores inválidos", () => {
    expect(() => calcularEstandaresAplicables([])).toThrow()
    expect(() => calcularEstandaresAplicables([sede("I", 0)])).toThrow()
    expect(() => calcularEstandaresAplicables([sede("I", 2.5)])).toThrow()
  })
})
