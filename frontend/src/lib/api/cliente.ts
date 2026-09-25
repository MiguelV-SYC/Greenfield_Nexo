import createClient, { type Middleware } from "openapi-fetch"

import type { components, paths } from "./esquema"
import { leerIdentidad } from "./identidad-simulada"

export type Esquemas = components["schemas"]
export type Tarjeta = Esquemas["TarjetaOrganizacionDto"]
export type ListaOrganizaciones = Esquemas["ListaOrganizacionesDto"]

/** Error de la API con los campos inválidos (design.md § Contratos). */
export class ErrorApi extends Error {
  constructor(
    readonly estado: number,
    readonly errores: { campo: string; mensajes: string[] }[] = [],
  ) {
    super(`La API respondió ${estado}`)
  }
}

export const middlewareIdentidad: Middleware = {
  onRequest({ request }) {
    request.headers.set("x-usuario-mock", leerIdentidad())
    return request
  },
}

// Mismo origen: next.config.ts reenvía /api/v1 al backend.
export const api = createClient<paths>({ baseUrl: "" })
api.use(middlewareIdentidad)

/** Devuelve los datos o lanza ErrorApi con el estado y los campos inválidos. */
export function exigir<T>(resultado: {
  data?: T
  error?: unknown
  response: Response
}): T {
  if (resultado.data !== undefined) return resultado.data
  const cuerpo = resultado.error as
    { errores?: ErrorApi["errores"] } | undefined
  throw new ErrorApi(resultado.response.status, cuerpo?.errores ?? [])
}
