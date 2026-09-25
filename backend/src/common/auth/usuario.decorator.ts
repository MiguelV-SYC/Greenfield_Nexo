import { createParamDecorator, type ExecutionContext } from "@nestjs/common"

import type { PeticionAutenticada } from "./guards"
import type { UsuarioActual } from "./usuario-actual"

/** Inyecta en el controller el usuario que fijó AutenticacionGuard. */
export const Usuario = createParamDecorator(
  (_dato: unknown, contexto: ExecutionContext): UsuarioActual => {
    const usuario = contexto
      .switchToHttp()
      .getRequest<PeticionAutenticada>().usuarioActual
    if (!usuario)
      throw new Error("Usuario no autenticado: falta AutenticacionGuard")
    return usuario
  },
)
