// MOCK de D1 (DEC-11): hasta que exista `auth`, el frontend envía la
// identidad en la cabecera x-usuario-mock. Ver
// specs/organizaciones/mocks/usuario-actual.mock.ts.

const CLAVE = "nexo.identidadSimulada"
export const IDENTIDAD_POR_DEFECTO = "lider-demo"
const LARGO_MAXIMO = 64

/** "admin…" entra como Administrador; cualquier otro usuario, como Líder SST. */
export function identidadDesdeUsuario(usuario: string): string {
  const id = usuario
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, LARGO_MAXIMO)
  if (id === "") return IDENTIDAD_POR_DEFECTO
  return id.startsWith("admin") ? `${id};admin` : id
}

export function guardarIdentidad(identidad: string): void {
  try {
    window.localStorage.setItem(CLAVE, identidad)
  } catch {
    // Sin almacenamiento disponible: se usa la identidad por defecto.
  }
}

export function leerIdentidad(): string {
  try {
    return window.localStorage.getItem(CLAVE) ?? IDENTIDAD_POR_DEFECTO
  } catch {
    return IDENTIDAD_POR_DEFECTO
  }
}

export function esAdministrador(identidad: string): boolean {
  return identidad.endsWith(";admin")
}
