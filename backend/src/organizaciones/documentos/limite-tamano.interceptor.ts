import {
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
  PayloadTooLargeException,
} from "@nestjs/common"
import { type Observable, catchError, throwError } from "rxjs"

import { MAX_TAMANO_DOCUMENTO_MB } from "@/organizaciones/dominio/documentos-legales"

function demasiadoGrande(): PayloadTooLargeException {
  return new PayloadTooLargeException(
    `El archivo supera el tamaño máximo permitido de ${MAX_TAMANO_DOCUMENTO_MB} MB`,
  )
}

/**
 * R7.9: 413 con el tamaño máximo en el mensaje. Multer (en memoria) corta el
 * archivo en cuanto pasa de 10 MB, sin guardar el resto del cuerpo; aquí solo
 * se reescribe su mensaje. Debe ir antes del interceptor de multer en
 * `@UseInterceptors`.
 *
 * No se rechaza por Content-Length antes de leer: responder con el cuerpo a
 * medio subir corta la conexión y el cliente ve un ECONNRESET, no el 413.
 */
export class LimiteTamanoInterceptor implements NestInterceptor {
  intercept(
    _contexto: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError((error: unknown) =>
          throwError(() =>
            error instanceof PayloadTooLargeException
              ? demasiadoGrande()
              : error,
          ),
        ),
      )
  }
}
