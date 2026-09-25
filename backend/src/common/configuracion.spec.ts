// Derived from T3 (scaffolding del backend; sin R*.*)
import { leerConfiguracion } from "./configuracion"

describe("leerConfiguracion", () => {
  it("usa valores por defecto cuando no hay variables de entorno", () => {
    expect(leerConfiguracion({})).toEqual({
      puerto: 3000,
      entorno: "development",
      nivelLog: "info",
      modoAutenticacion: "ninguno",
    })
  })

  it("lee puerto, entorno y nivel de log del entorno", () => {
    const configuracion = leerConfiguracion({
      PORT: "4100",
      NODE_ENV: "test",
      LOG_LEVEL: "warn",
    })
    expect(configuracion).toEqual({
      puerto: 4100,
      entorno: "test",
      nivelLog: "warn",
      modoAutenticacion: "ninguno",
    })
  })

  it("rechaza un puerto que no es un entero válido", () => {
    expect(() => leerConfiguracion({ PORT: "abc" })).toThrow("PORT")
    expect(() => leerConfiguracion({ PORT: "70000" })).toThrow("PORT")
  })
})

describe("modo de autenticación", () => {
  // Derived from D1 (DEC-11: el mock nunca en producción)
  it("usa el modo mock cuando AUTH_MODO=mock", () => {
    expect(leerConfiguracion({ AUTH_MODO: "mock" }).modoAutenticacion).toBe(
      "mock",
    )
  })

  it("sin AUTH_MODO no autentica a nadie", () => {
    expect(leerConfiguracion({}).modoAutenticacion).toBe("ninguno")
  })

  it("impide arrancar con AUTH_MODO=mock en producción", () => {
    expect(() =>
      leerConfiguracion({ AUTH_MODO: "mock", NODE_ENV: "production" }),
    ).toThrow("AUTH_MODO=mock")
  })

  it("rechaza un AUTH_MODO desconocido", () => {
    expect(() => leerConfiguracion({ AUTH_MODO: "oauth" })).toThrow("AUTH_MODO")
  })
})
