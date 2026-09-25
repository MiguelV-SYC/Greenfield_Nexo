// Derived from T3 (scaffolding del backend; sin R*.*)
import { leerConfiguracion } from "./configuracion"

describe("leerConfiguracion", () => {
  it("usa valores por defecto cuando no hay variables de entorno", () => {
    expect(leerConfiguracion({})).toEqual({
      puerto: 3000,
      entorno: "development",
      nivelLog: "info",
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
    })
  })

  it("rechaza un puerto que no es un entero válido", () => {
    expect(() => leerConfiguracion({ PORT: "abc" })).toThrow("PORT")
    expect(() => leerConfiguracion({ PORT: "70000" })).toThrow("PORT")
  })
})
