import { Global, Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"

import { leerConfiguracion } from "@/common/configuracion"
import {
  AutenticacionGuard,
  MODO_AUTENTICACION,
  SoloAdministradorGuard,
} from "./guards"

@Global()
@Module({
  providers: [
    {
      provide: MODO_AUTENTICACION,
      useFactory: () => leerConfiguracion().modoAutenticacion,
    },
    { provide: APP_GUARD, useClass: AutenticacionGuard },
    SoloAdministradorGuard,
  ],
  exports: [SoloAdministradorGuard],
})
export class AuthModule {}
