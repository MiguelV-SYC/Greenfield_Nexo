import {
  BadRequestException,
  type PipeTransform,
  UnsupportedMediaTypeException,
} from "@nestjs/common"

import {
  FORMATOS_ACEPTADOS,
  MAX_TAMANO_DOCUMENTO_BYTES,
  type TipoMimeDocumento,
  detectarTipoArchivo,
} from "@/organizaciones/dominio/documentos-legales"

/** Lo que entrega multer (en memoria) por cada archivo recibido. */
export interface ArchivoRecibido {
  originalname: string
  size: number
  buffer: Buffer
}

/** Archivo ya verificado, listo para guardar. */
export interface ArchivoDocumento {
  contenido: Buffer
  nombreArchivo: string
  tipoMime: TipoMimeDocumento
  tamanoBytes: number
}

/** Opciones de multer: en memoria y hasta 10 MB por archivo (R7.9). */
export function opcionesCarga(maxArchivos: number) {
  return {
    limits: { fileSize: MAX_TAMANO_DOCUMENTO_BYTES, files: maxArchivos },
    defParamCharset: "utf8",
  }
}

const LARGO_MAXIMO_NOMBRE = 200
const CONTROL = /[\u0000-\u001f\u007f]/g

/** Solo el nombre, sin ruta ni caracteres de control. */
export function nombreSeguro(original: string): string {
  const nombre = (original.split(/[\\/]/).pop() ?? "")
    .replace(CONTROL, "")
    .trim()
    .slice(0, LARGO_MAXIMO_NOMBRE)
  return nombre || "documento"
}

/** R7.2, R7.3: el tipo se decide por la firma del contenido. */
export function verificarArchivo(archivo: ArchivoRecibido): ArchivoDocumento {
  const tipoMime = detectarTipoArchivo(archivo.buffer)
  if (!tipoMime) {
    throw new UnsupportedMediaTypeException(
      `Formato no aceptado. Formatos aceptados: ${FORMATOS_ACEPTADOS}`,
    )
  }
  return {
    contenido: archivo.buffer,
    nombreArchivo: nombreSeguro(archivo.originalname),
    tipoMime,
    tamanoBytes: archivo.size,
  }
}

/** Pipe de `@UploadedFile`: exige el archivo y lo verifica. */
export class ArchivoDocumentoPipe implements PipeTransform<
  ArchivoRecibido | undefined,
  ArchivoDocumento
> {
  transform(archivo: ArchivoRecibido | undefined): ArchivoDocumento {
    if (!archivo) {
      throw new BadRequestException({
        statusCode: 400,
        message: "Datos inválidos",
        errores: [
          { campo: "archivo", mensajes: ["El archivo es obligatorio"] },
        ],
      })
    }
    return verificarArchivo(archivo)
  }
}
