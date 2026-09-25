import { Global, Module } from "@nestjs/common"

import { BaseDatosTenant } from "@/common/tenant/base-datos-tenant"
import { PrismaService } from "./prisma.service"

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: BaseDatosTenant,
      useFactory: (prisma: PrismaService) => new BaseDatosTenant(prisma),
      inject: [PrismaService],
    },
  ],
  exports: [PrismaService, BaseDatosTenant],
})
export class PrismaModule {}
