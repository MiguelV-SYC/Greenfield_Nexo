export type ClaseRiesgo = "I" | "II" | "III" | "IV" | "V"

export interface SedeRiesgo {
  claseRiesgo: ClaseRiesgo
  trabajadores: number
}

export interface EstandaresAplicables {
  estandares: 7 | 21 | 62
  riesgoMaximo: ClaseRiesgo
  totalTrabajadores: number
  regla: string
}

const ORDEN_RIESGO: Record<ClaseRiesgo, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
}
const LIMITE_EMPRESA_PEQUENA = 10
const LIMITE_EMPRESA_MEDIANA = 50

function riesgoMaximoDe(sedes: SedeRiesgo[]): ClaseRiesgo {
  return sedes.reduce<ClaseRiesgo>(
    (maximo, s) =>
      ORDEN_RIESGO[s.claseRiesgo] > ORDEN_RIESGO[maximo]
        ? s.claseRiesgo
        : maximo,
    "I",
  )
}

function validarSedes(sedes: SedeRiesgo[]): void {
  if (sedes.length === 0) throw new Error("Se requiere al menos una sede")
  const invalida = sedes.some(
    (s) => !Number.isInteger(s.trabajadores) || s.trabajadores < 1,
  )
  if (invalida) throw new Error("Cada sede debe tener al menos un trabajador")
}

/**
 * Estándares mínimos del SG-SST según la Resolución 0312 de 2019 (R3.1–R3.4),
 * evaluando el total de trabajadores y la sede de mayor riesgo. Única
 * implementación de la regla (DEC-5); corrige la del mockup V5 (DEC-10).
 */
export function calcularEstandaresAplicables(
  sedes: SedeRiesgo[],
): EstandaresAplicables {
  validarSedes(sedes)
  const totalTrabajadores = sedes.reduce((suma, s) => suma + s.trabajadores, 0)
  const riesgoMaximo = riesgoMaximoDe(sedes)
  const base = { riesgoMaximo, totalTrabajadores }

  if (totalTrabajadores > LIMITE_EMPRESA_MEDIANA) {
    const regla = "Más de 50 trabajadores en total, cualquier clase de riesgo"
    return { ...base, estandares: 62, regla }
  }
  if (riesgoMaximo === "IV" || riesgoMaximo === "V") {
    const regla = `50 o menos trabajadores con al menos una sede en riesgo ${riesgoMaximo}`
    return { ...base, estandares: 62, regla }
  }
  if (totalTrabajadores > LIMITE_EMPRESA_PEQUENA) {
    const regla = "Entre 11 y 50 trabajadores con riesgo máximo I, II o III"
    return { ...base, estandares: 21, regla }
  }
  const regla = "10 o menos trabajadores con riesgo máximo I, II o III"
  return { ...base, estandares: 7, regla }
}
