import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"

import { AuditoriaModule } from "@/common/auditoria/auditoria.module"
import { AuthModule } from "@/common/auth/auth.module"
import { leerConfiguracion } from "@/common/configuracion"
import { PrismaModule } from "@/common/prisma/prisma.module"
import { CatalogosModule } from "@/organizaciones/catalogos/catalogos.module"

const { nivelLog } = leerConfiguracion()

@Module({
  imports: [
    AuditoriaModule,
    AuthModule,
    PrismaModule,
    CatalogosModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: nivelLog,
        // stack/security.md: nada de credenciales ni identidades simuladas en los logs.
        redact: [
          "req.headers.authorization",
          "req.headers.cookie",
          'req.headers["x-usuario-mock"]',
        ],
      },
    }),
  ],
})
export class AppModule {}
