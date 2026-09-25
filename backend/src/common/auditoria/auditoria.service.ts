import { Injectable } from "@nestjs/common"

import type { Prisma } from "@/generated/prisma/client"
import type { TransaccionBd } from "@/common/tenant/base-datos-tenant"

export type AccionAuditoria =
  | "REGISTRAR"
  | "APROBAR"
  | "DEVOLVER"
  | "REENVIAR"
  | "CORREGIR"
  | "EDITAR"
  | "CARGAR_DOCUMENTO"

export type EntidadAuditada = "Organizacion" | "Sede" | "DocumentoLegal"

export interface EntradaAuditoria {
  organizacionId: string
  entidad: EntidadAuditada
  entidadId: string
  accion: AccionAuditoria
  valorAnterior?: Prisma.InputJsonValue
  valorNuevo?: Prisma.InputJsonValue
  motivo?: string
}

/**
 * Registro append-only en AuditoriaCambio (R6.3, R6.4, R8.4, NFR4). Se llama
 * dentro de la misma transacción que hace el cambio: si el cambio se revierte,
 * su auditoría también. La base impide UPDATE/DELETE y que se registre en
 * nombre de otro usuario (RLS).
 */
@Injectable()
export class AuditoriaService {
  async registrar(
    tx: TransaccionBd,
    usuarioId: string,
    entrada: EntradaAuditoria,
  ): Promise<void> {
    await tx.auditoriaCambio.create({ data: { ...entrada, usuarioId } })
  }
}
