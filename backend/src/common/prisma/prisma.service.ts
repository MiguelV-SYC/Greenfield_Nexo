import { Injectable, type OnModuleDestroy } from "@nestjs/common"
import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"

export function urlBaseAplicacion(
  entorno: NodeJS.ProcessEnv = process.env,
): string {
  const url = entorno.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL no está definida")
  return url
}

/**
 * Cliente de la aplicación: se conecta como nexo_app (sin BYPASSRLS, ADR-0001).
 * Las migraciones usan otro rol desde la CLI (prisma.config.ts).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: urlBaseAplicacion() }) })
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
