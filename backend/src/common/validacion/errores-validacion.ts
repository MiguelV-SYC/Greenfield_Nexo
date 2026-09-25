import { BadRequestException } from "@nestjs/common"
import type { ValidationError } from "class-validator"

export interface ErrorDeCampo {
  campo: string
  mensajes: string[]
}

/** Aplana los errores de class-validator con la ruta completa (`sedes.0.trabajadores`). */
export function aplanarErrores(
  errores: ValidationError[],
  prefijo = "",
): ErrorDeCampo[] {
  return errores.flatMap((e) => {
    const campo = prefijo ? `${prefijo}.${e.property}` : e.property
    const propios = e.constraints
      ? [{ campo, mensajes: Object.values(e.constraints) }]
      : []
    return [...propios, ...aplanarErrores(e.children ?? [], campo)]
  })
}

/** design.md § Contratos: 400 con cada campo inválido en `errores[].campo`. */
export function crearExcepcionValidacion(
  errores: ValidationError[],
): BadRequestException {
  return new BadRequestException({
    statusCode: 400,
    message: "Datos inválidos",
    errores: aplanarErrores(errores),
  })
}
