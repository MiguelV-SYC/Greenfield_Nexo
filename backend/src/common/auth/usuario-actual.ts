/** Identidad de quien hace la petición. En P1 la produce el mock de D1. */
export interface UsuarioActual {
  id: string
  esAdmin: boolean
}
