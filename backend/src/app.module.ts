import { Module } from "@nestjs/common"
import { LoggerModule } from "nestjs-pino"

import { AuditoriaModule } from "@/common/auditoria/auditoria.module"
import { AuthModule } from "@/common/auth/auth.module"
import { leerConfiguracion } from "@/common/configuracion"
import { PrismaModule } from "@/common/prisma/prisma.module"
import { OrganizacionesModule } from "@/organizaciones/organizaciones.module"

const { nivelLog } = leerConfiguracion()

@Module({
  imports: [
    AuditoriaModule,
    AuthModule,
    PrismaModule,
    OrganizacionesModule,
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
