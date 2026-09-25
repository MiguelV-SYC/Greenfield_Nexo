import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"

import type { ModoAutenticacion } from "@/common/configuracion"
import {
  CABECERA_IDENTIDAD_SIMULADA,
  leerIdentidadSimulada,
} from "./identidad-simulada"
import type { UsuarioActual } from "./usuario-actual"

export const MODO_AUTENTICACION = Symbol("MODO_AUTENTICACION")

export interface PeticionAutenticada {
  headers: Record<string, string | string[] | undefined>
  usuarioActual?: UsuarioActual
}

/**
 * Guard global. Con AUTH_MODO=mock toma la identidad de la cabecera
 * x-usuario-mock (D1, DEC-11); sin modo configurado no deja pasar a nadie.
 * Se reemplaza por el guard de `auth` al desmockear D1.
 */
@Injectable()
export class AutenticacionGuard implements CanActivate {
  constructor(
    @Inject(MODO_AUTENTICACION) private readonly modo: ModoAutenticacion,
  ) {}

  canActivate(contexto: ExecutionContext): boolean {
    const peticion = contexto.switchToHttp().getRequest<PeticionAutenticada>()
    const cabecera = peticion.headers[CABECERA_IDENTIDAD_SIMULADA]
    const usuario =
      this.modo === "mock" && typeof cabecera === "string"
        ? leerIdentidadSimulada(cabecera)
        : null
    if (!usuario) throw new UnauthorizedException()
    peticion.usuarioActual = usuario
    return true
  }
}

/** Rutas /admin/*: solo el Administrador de la plataforma (R4.9). */
@Injectable()
export class SoloAdministradorGuard implements CanActivate {
  canActivate(contexto: ExecutionContext): boolean {
    const peticion = contexto.switchToHttp().getRequest<PeticionAutenticada>()
    if (!peticion.usuarioActual?.esAdmin) throw new ForbiddenException()
    return true
  }
}
