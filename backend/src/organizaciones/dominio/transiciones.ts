export type EstadoOrganizacion = "EN_VALIDACION" | "DEVUELTA" | "APROBADA"
export type AccionOrganizacion =
  "APROBAR" | "DEVOLVER" | "CORREGIR" | "REENVIAR" | "EDITAR"
export type RolActor = "ADMINISTRADOR" | "LIDER_SST"

interface Transicion {
  rol: RolActor
  desde: EstadoOrganizacion
  hacia: EstadoOrganizacion
}

// R4.3–R4.10 y R8.1: toda combinación que no esté aquí se rechaza.
const TRANSICIONES: Record<AccionOrganizacion, Transicion> = {
  APROBAR: { rol: "ADMINISTRADOR", desde: "EN_VALIDACION", hacia: "APROBADA" },
  DEVOLVER: { rol: "ADMINISTRADOR", desde: "EN_VALIDACION", hacia: "DEVUELTA" },
  CORREGIR: { rol: "LIDER_SST", desde: "DEVUELTA", hacia: "DEVUELTA" },
  REENVIAR: { rol: "LIDER_SST", desde: "DEVUELTA", hacia: "EN_VALIDACION" },
  EDITAR: { rol: "LIDER_SST", desde: "APROBADA", hacia: "APROBADA" },
}

/** El rol no puede ejecutar la acción (→ 403). */
export class AccionNoPermitidaError extends Error {}

/** La acción no aplica al estado actual (→ 409). */
export class TransicionInvalidaError extends Error {}

export function aplicarTransicion(
  estado: EstadoOrganizacion,
  accion: AccionOrganizacion,
  rol: RolActor,
): EstadoOrganizacion {
  const transicion = TRANSICIONES[accion]
  if (transicion.rol !== rol) {
    throw new AccionNoPermitidaError(`${rol} no puede ${accion}`)
  }
  if (transicion.desde !== estado) {
    throw new TransicionInvalidaError(
      `No se puede ${accion} una organización ${estado}`,
    )
  }
  return transicion.hacia
}

/** R8.6: el NIT y su DV solo se corrigen mientras la organización está Devuelta. */
export function puedeModificarNit(estado: EstadoOrganizacion): boolean {
  return estado === "DEVUELTA"
}
