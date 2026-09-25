// Derived from design.md § Contratos (errores[].campo) y D1 (x-usuario-mock)
import { ErrorApi, exigir, middlewareIdentidad } from "./cliente"
import { guardarIdentidad } from "./identidad-simulada"

const respuesta = (status: number) => ({ status }) as Response

describe("cliente de la API", () => {
  it("devuelve los datos de una respuesta correcta", () => {
    expect(exigir({ data: { ok: true }, response: respuesta(200) })).toEqual({
      ok: true,
    })
  })

  it("lanza ErrorApi con el estado y los campos inválidos", () => {
    const error = { errores: [{ campo: "nit", mensajes: ["solo dígitos"] }] }
    expect(() => exigir({ error, response: respuesta(400) })).toThrow(ErrorApi)
    try {
      exigir({ error, response: respuesta(400) })
    } catch (e) {
      expect(e).toMatchObject({ estado: 400, errores: error.errores })
    }
  })

  it("lanza ErrorApi sin campos cuando la API no los envía", () => {
    expect(() =>
      exigir({ error: undefined, response: respuesta(500) }),
    ).toThrow("La API respondió 500")
  })

  it("envía la identidad simulada en cada petición", () => {
    guardarIdentidad("lider-a")
    const cabeceras = new Map<string, string>()
    const request = {
      headers: { set: (k: string, v: string) => cabeceras.set(k, v) },
    }
    const onRequest = middlewareIdentidad.onRequest as unknown as (p: {
      request: typeof request
    }) => unknown
    onRequest({ request })
    expect(cabeceras.get("x-usuario-mock")).toBe("lider-a")
  })
})
