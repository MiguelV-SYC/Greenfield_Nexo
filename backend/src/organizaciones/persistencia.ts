import type { TransaccionBd } from "@/common/tenant/base-datos-tenant"
import { Prisma } from "@/generated/prisma/client"
import {
  type EstadoOrganizacion,
  TransicionInvalidaError,
} from "./dominio/transiciones"
import type { OrganizacionDto } from "./dto/organizacion.dto"
import { aDetalle } from "./mapeo"

const FORMATO_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** R6.1: un id mal formado se trata igual que una organización ajena (404). */
export function esUuid(id: string): boolean {
  return FORMATO_UUID.test(id)
}

/** R1.7: violación del índice único del NIT. */
export function esNitDuplicado(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

/**
 * Actualiza la organización solo si sigue en el estado que se leyó. Si otra
 * operación la cambió entre la lectura y la escritura, responde 409.
 */
export async function actualizarSiSigueEn(
  tx: TransaccionBd,
  id: string,
  estado: EstadoOrganizacion,
  datos: Prisma.OrganizacionUpdateManyMutationInput,
): Promise<void> {
  const { count } = await tx.organizacion.updateMany({
    where: { id, estado },
    data: datos,
  })
  if (count !== 1) {
    throw new TransicionInvalidaError("La organización cambió de estado")
  }
}

export async function leerDetalle(
  tx: TransaccionBd,
  id: string,
): Promise<OrganizacionDto> {
  const organizacion = await tx.organizacion.findUniqueOrThrow({
    where: { id },
    include: { sedes: true },
  })
  return aDetalle(organizacion)
}

/** Copia serializable para la auditoría (fechas como texto). */
export function instantanea(detalle: OrganizacionDto): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(detalle)) as Prisma.InputJsonValue
}
