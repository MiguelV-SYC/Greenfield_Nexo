import type { Esquemas } from "@/lib/api/cliente"

export type TipoDocumentoLegal = Esquemas["DocumentoLegalDto"]["tipo"]
export type ArchivosDocumentos = Partial<Record<TipoDocumentoLegal, File>>

export interface DefinicionDocumento {
  tipo: TipoDocumentoLegal
  nombre: string
  nota: string
  obligatorio: boolean
}

/** R7.1, en el orden y con las notas del paso 3 del mockup V5. */
export const DOCUMENTOS: readonly DefinicionDocumento[] = [
  {
    tipo: "RUT",
    nombre: "RUT actualizado",
    nota: "Registro Único Tributario vigente",
    obligatorio: true,
  },
  {
    tipo: "CAMARA_COMERCIO",
    nombre: "Certificado de Cámara de Comercio",
    nota: "Vigencia no mayor a 90 días, con representación legal",
    obligatorio: true,
  },
  {
    tipo: "CEDULA_REP_LEGAL",
    nombre: "Cédula del representante legal",
    nota: "Fotocopia del documento de identidad",
    obligatorio: true,
  },
  {
    tipo: "FORMULARIO_ARL",
    nombre: "Formulario de afiliación a ARL",
    nota: "Firmado por el representante legal",
    obligatorio: true,
  },
  {
    tipo: "NO_AFILIACION_ARL",
    nombre: "Certificado de no afiliación a otra ARL",
    nota: "Aplica solo para afiliaciones iniciales",
    obligatorio: false,
  },
]

/** R7.9 */
export const MAX_TAMANO_BYTES = 10 * 1024 * 1024

/**
 * R7.3, R7.9: aviso inmediato en el navegador. El backend vuelve a verificar
 * el tipo por el contenido del archivo.
 */
export function problemaDelArchivo(archivo: File): string | null {
  const esPdfOImagen =
    archivo.type === "application/pdf" || archivo.type.startsWith("image/")
  if (!esPdfOImagen) {
    return "Formato no aceptado. Formatos aceptados: PDF, JPG, PNG o WebP"
  }
  if (archivo.size > MAX_TAMANO_BYTES) {
    return "El archivo supera el tamaño máximo permitido de 10 MB"
  }
  return null
}

/** R7.5: obligatorios sin archivo. */
export function documentosFaltantes(
  presentes: Iterable<TipoDocumentoLegal>,
): TipoDocumentoLegal[] {
  const cargados = new Set(presentes)
  return DOCUMENTOS.filter((d) => d.obligatorio && !cargados.has(d.tipo)).map(
    (d) => d.tipo,
  )
}

export function nombresDe(tipos: readonly string[]): string {
  return DOCUMENTOS.filter((d) => tipos.includes(d.tipo))
    .map((d) => d.nombre)
    .join(", ")
}

const kb = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 })
const mb = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 })

export function tamanoLegible(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${kb.format(Math.max(1, bytes / 1024))} KB`
    : `${mb.format(bytes / (1024 * 1024))} MB`
}
