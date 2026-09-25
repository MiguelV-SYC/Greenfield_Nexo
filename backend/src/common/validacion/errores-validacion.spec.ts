// Derived from design.md § Contratos (400 con el campo en errores[].campo)
import type { ValidationError } from "class-validator"

import { aplanarErrores, crearExcepcionValidacion } from "./errores-validacion"

const error = (
  property: string,
  constraints?: Record<string, string>,
  children: ValidationError[] = [],
): ValidationError => ({ property, constraints, children })

describe("errores de validación", () => {
  it("aplana errores anidados con la ruta completa del campo", () => {
    const errores = [
      error("razonSocial", { isNotEmpty: "razonSocial es obligatoria" }),
      error("sedes", undefined, [
        error("0", undefined, [error("trabajadores", { min: "mínimo 1" })]),
      ]),
    ]
    expect(aplanarErrores(errores)).toEqual([
      { campo: "razonSocial", mensajes: ["razonSocial es obligatoria"] },
      { campo: "sedes.0.trabajadores", mensajes: ["mínimo 1"] },
    ])
  })

  it("crea una respuesta 400 con la lista de campos", () => {
    const excepcion = crearExcepcionValidacion([
      error("nit", { matches: "solo dígitos" }),
    ])
    expect(excepcion.getStatus()).toBe(400)
    expect(excepcion.getResponse()).toEqual({
      statusCode: 400,
      message: "Datos inválidos",
      errores: [{ campo: "nit", mensajes: ["solo dígitos"] }],
    })
  })
})
