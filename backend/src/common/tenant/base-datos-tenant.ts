import type { Prisma, PrismaClient } from "@/generated/prisma/client"

/** Identidad con la que se ejecuta una unidad de trabajo contra la base. */
export interface ContextoBd {
  usuarioId: string
  esAdmin: boolean
  /** Solo en el registro: id de la organización que se está creando (R4.2). */
  organizacionNueva?: string
}

export type TransaccionBd = Prisma.TransactionClient

/**
 * Abre una transacción, fija las variables de sesión que leen las políticas
 * RLS (set_config local a la transacción) y ejecuta el trabajo dentro de ella.
 * Todo acceso de la aplicación a tablas de negocio pasa por aquí (ADR-0001).
 */
export class BaseDatosTenant {
  constructor(private readonly prisma: PrismaClient) {}

  ejecutarComo<T>(
    contexto: ContextoBd,
    trabajo: (tx: TransaccionBd) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT
        set_config('app.usuario_id', ${contexto.usuarioId}, true),
        set_config('app.es_admin', ${String(contexto.esAdmin)}, true),
        set_config('app.organizacion_nueva', ${contexto.organizacionNueva ?? ""}, true)`
      return trabajo(tx)
    })
  }
}
