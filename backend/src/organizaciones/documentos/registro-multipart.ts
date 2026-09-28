import {
  BadRequestException,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
  type PipeTransform,
  UnprocessableEntityException,
} from "@nestjs/common"
import type { Request } from "express"
import type { Observable } from "rxjs"

import {
  DOCUMENTOS_LEGALES,
  TIPOS_DOCUMENTO_LEGAL,
  type TipoDocumentoLegal,
} from "@/organizaciones/dominio/documentos-legales"
import {
  type ArchivoDocumento,
  type ArchivoRecibido,
  verificarArchivo,
} from "./archivo-recibido"

export type ArchivosPorTipo = Partial<
  Record<TipoDocumentoLegal, ArchivoDocumento>
>

/** Campos de archivo del multipart: uno por tipo de documento (DEC-4). */
export const CAMPOS_DOCUMENTOS = TIPOS_DOCUMENTO_LEGAL.map((name) => ({
  name,
  maxCount: 1,
}))

function datosInvalidos(mensaje: string): BadRequestException {
  return new BadRequestException({
    statusCode: 400,
    message: "Datos inválidos",
    errores: [{ campo: "datos", mensajes: [mensaje] }],
  })
}

/**
 * DEC-4: en multipart, los datos de la organización llegan como JSON en el
 * campo `datos`. Se reemplaza el cuerpo por ese JSON para que el
 * ValidationPipe global lo valide igual que una petición JSON. Va después
 * del interceptor de multer.
 */
export class DatosMultipartInterceptor implements NestInterceptor {
  intercept(
    contexto: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const peticion = contexto.switchToHttp().getRequest<Request>()
    if (peticion.is("multipart/form-data")) {
      const { datos } = (peticion.body ?? {}) as { datos?: unknown }
      if (typeof datos !== "string") {
        throw datosInvalidos("El campo datos es obligatorio")
      }
      try {
        peticion.body = JSON.parse(datos) as unknown
      } catch {
        throw datosInvalidos("El campo datos debe ser JSON")
      }
    }
    return next.handle()
  }
}

/** Pipe de `@UploadedFiles`: verifica cada archivo por su firma (R7.2, R7.3). */
export class ArchivosDocumentosPipe implements PipeTransform<
  Record<string, ArchivoRecibido[] | undefined> | undefined,
  ArchivosPorTipo
> {
  transform(
    campos: Record<string, ArchivoRecibido[] | undefined> | undefined,
  ): ArchivosPorTipo {
    const archivos: ArchivosPorTipo = {}
    for (const tipo of TIPOS_DOCUMENTO_LEGAL) {
      const recibido = campos?.[tipo]?.[0]
      if (recibido) archivos[tipo] = verificarArchivo(recibido)
    }
    return archivos
  }
}

/** R7.5: 422 indicando cuáles obligatorios faltan. */
export function excepcionDocumentosFaltantes(
  faltantes: TipoDocumentoLegal[],
): UnprocessableEntityException {
  const nombres = DOCUMENTOS_LEGALES.filter((d) =>
    faltantes.includes(d.tipo),
  ).map((d) => d.nombre)
  return new UnprocessableEntityException({
    statusCode: 422,
    message: `Faltan documentos obligatorios: ${nombres.join(", ")}`,
    faltantes,
  })
}
