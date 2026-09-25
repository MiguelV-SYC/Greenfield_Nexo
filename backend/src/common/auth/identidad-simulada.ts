import type { UsuarioActual } from "./usuario-actual"

export const CABECERA_IDENTIDAD_SIMULADA = "x-usuario-mock"

// `<usuarioId>` o `<usuarioId>;admin` (DEC-11). El id se limita a un formato
// seguro porque termina en variables de sesión de la base y en los logs.
const FORMATO = /^([A-Za-z0-9_-]{1,64})(;admin)?$/

export function leerIdentidadSimulada(
  valor: string | undefined,
): UsuarioActual | null {
  const coincidencia = valor === undefined ? null : FORMATO.exec(valor)
  if (!coincidencia) return null
  return { id: coincidencia[1], esAdmin: coincidencia[2] !== undefined }
}
