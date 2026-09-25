import { z } from "zod"

import type { Esquemas } from "@/lib/api/cliente"

export type CuerpoRegistro = Esquemas["RegistrarOrganizacionDto"]
export const CLASES_RIESGO = ["I", "II", "III", "IV", "V"] as const

const requerido = (mensaje: string) => z.string().trim().min(1, mensaje)

// Mismas reglas de forma que el backend (R1.1–R2.4), para avisar antes de
// enviar. El DV, el NIT duplicado y los catálogos los decide el backend.
export const esquemaSede = z.object({
  nombre: requerido("Escribe el nombre de la sede"),
  direccion: requerido("Escribe la dirección"),
  departamentoCodigo: requerido("Elige el departamento"),
  municipioCodigo: requerido("Elige el municipio"),
  claseRiesgo: z.enum(CLASES_RIESGO),
  trabajadores: z
    .number({ error: "Escribe el número de trabajadores" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 trabajador"),
  ciiuCodigo: requerido("Elige una actividad del catálogo CIIU"),
})

export const esquemaRegistro = z.object({
  razonSocial: requerido("La razón social es obligatoria"),
  nombreComercial: z.string().trim(),
  tipoPersona: z.enum(["JURIDICA", "NATURAL"]),
  nit: z
    .string()
    .trim()
    .regex(/^\d{1,15}$/, "Solo dígitos, sin puntos ni guiones"),
  digitoVerificacion: z.string().trim().regex(/^\d$/, "Un solo dígito"),
  repLegalNombre: requerido("El nombre del representante legal es obligatorio"),
  repLegalTipoDoc: z.enum(["", "CC", "CE", "PASAPORTE"]),
  repLegalNumeroDoc: z.string().trim(),
  arlCodigo: z.string(),
  sedes: z.array(esquemaSede).min(1, "Agrega al menos una sede"),
})

export type FormularioRegistro = z.input<typeof esquemaRegistro>
export type SedeFormulario = z.input<typeof esquemaSede>

export const CAMPOS_PASO_1 = [
  "razonSocial",
  "nombreComercial",
  "tipoPersona",
  "nit",
  "digitoVerificacion",
  "repLegalNombre",
  "repLegalTipoDoc",
  "repLegalNumeroDoc",
  "arlCodigo",
] as const

export function sedeVacia(): SedeFormulario {
  return {
    nombre: "",
    direccion: "",
    departamentoCodigo: "",
    municipioCodigo: "",
    claseRiesgo: "III",
    trabajadores: 1,
    ciiuCodigo: "",
  }
}

export function valoresIniciales(): FormularioRegistro {
  return {
    razonSocial: "",
    nombreComercial: "",
    tipoPersona: "JURIDICA", // R1.3: Jurídica como valor inicial
    nit: "",
    digitoVerificacion: "",
    repLegalNombre: "",
    repLegalTipoDoc: "",
    repLegalNumeroDoc: "",
    arlCodigo: "",
    sedes: [sedeVacia()],
  }
}

/** Los opcionales vacíos no se envían (R1.2). */
export function aCuerpo(
  valores: z.output<typeof esquemaRegistro>,
): CuerpoRegistro {
  const {
    nombreComercial,
    repLegalTipoDoc,
    repLegalNumeroDoc,
    arlCodigo,
    ...resto
  } = valores
  return {
    ...resto,
    ...(nombreComercial ? { nombreComercial } : {}),
    ...(repLegalTipoDoc ? { repLegalTipoDoc } : {}),
    ...(repLegalNumeroDoc ? { repLegalNumeroDoc } : {}),
    ...(arlCodigo ? { arlCodigo } : {}),
  }
}

/** Paso del asistente al que pertenece un campo con error del servidor. */
export function pasoDelCampo(campo: string): 1 | 2 {
  return campo.startsWith("sedes") ? 2 : 1
}
