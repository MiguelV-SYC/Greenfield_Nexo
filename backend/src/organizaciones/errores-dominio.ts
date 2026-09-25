import { ConflictException, ForbiddenException } from "@nestjs/common"

import {
  AccionNoPermitidaError,
  TransicionInvalidaError,
} from "./dominio/transiciones"

/** Traduce los errores del dominio a HTTP: rol → 403, estado → 409 (T12). */
export function traducirErrorDominio(error: unknown): unknown {
  if (error instanceof AccionNoPermitidaError) {
    return new ForbiddenException(error.message)
  }
  if (error instanceof TransicionInvalidaError) {
    return new ConflictException(error.message)
  }
  return error
}
