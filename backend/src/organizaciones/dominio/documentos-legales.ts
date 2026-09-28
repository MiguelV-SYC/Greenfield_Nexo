export type TipoDocumentoLegal =
  | "RUT"
  | "CAMARA_COMERCIO"
  | "CEDULA_REP_LEGAL"
  | "FORMULARIO_ARL"
  | "NO_AFILIACION_ARL"

/** R7.9: tamaño máximo por archivo. */
export const MAX_TAMANO_DOCUMENTO_BYTES = 10 * 1024 * 1024
export const MAX_TAMANO_DOCUMENTO_MB = 10

export interface DefinicionDocumento {
  tipo: TipoDocumentoLegal
  nombre: string
  obligatorio: boolean
}

/** R7.1: documentos por organización, en el orden del paso 3 del asistente. */
export const DOCUMENTOS_LEGALES: readonly DefinicionDocumento[] = [
  { tipo: "RUT", nombre: "RUT actualizado", obligatorio: true },
  {
    tipo: "CAMARA_COMERCIO",
    nombre: "Certificado de Cámara de Comercio",
    obligatorio: true,
  },
  {
    tipo: "CEDULA_REP_LEGAL",
    nombre: "Cédula del representante legal",
    obligatorio: true,
  },
  {
    tipo: "FORMULARIO_ARL",
    nombre: "Formulario de afiliación a ARL",
    obligatorio: true,
  },
  {
    tipo: "NO_AFILIACION_ARL",
    nombre: "Certificado de no afiliación a otra ARL",
    obligatorio: false,
  },
]

export const TIPOS_DOCUMENTO_LEGAL = DOCUMENTOS_LEGALES.map((d) => d.tipo)

/** R7.5: obligatorios que no están entre los tipos cargados. */
export function documentosFaltantes(
  cargados: Iterable<TipoDocumentoLegal>,
): TipoDocumentoLegal[] {
  const presentes = new Set(cargados)
  return DOCUMENTOS_LEGALES.filter(
    (d) => d.obligatorio && !presentes.has(d.tipo),
  ).map((d) => d.tipo)
}

export type TipoMimeDocumento =
  "application/pdf" | "image/jpeg" | "image/png" | "image/webp"

/** R7.3: texto con los formatos aceptados para el mensaje de rechazo. */
export const FORMATOS_ACEPTADOS = "PDF, JPG, PNG o WebP"

function empiezaCon(contenido: Buffer, firma: number[], desde = 0): boolean {
  return firma.every((byte, i) => contenido[desde + i] === byte)
}

const ASCII = (texto: string) => [...texto].map((c) => c.charCodeAt(0))

/**
 * R7.2, R7.3: tipo real del archivo por su firma (magic bytes), no por la
 * extensión ni por el Content-Type que declara el cliente. `null` si no es
 * PDF ni una imagen aceptada.
 */
export function detectarTipoArchivo(
  contenido: Buffer,
): TipoMimeDocumento | null {
  if (empiezaCon(contenido, ASCII("%PDF-"))) return "application/pdf"
  if (empiezaCon(contenido, [0xff, 0xd8, 0xff])) return "image/jpeg"
  if (empiezaCon(contenido, [0x89, ...ASCII("PNG\r\n"), 0x1a, 0x0a])) {
    return "image/png"
  }
  if (
    empiezaCon(contenido, ASCII("RIFF")) &&
    empiezaCon(contenido, ASCII("WEBP"), 8)
  ) {
    return "image/webp"
  }
  return null
}
