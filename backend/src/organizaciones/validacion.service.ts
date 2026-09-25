import { Injectable, NotFoundException } from "@nestjs/common"

import { AuditoriaService } from "@/common/auditoria/auditoria.service"
import type { UsuarioActual } from "@/common/auth/usuario-actual"
import {
  BaseDatosTenant,
  type TransaccionBd,
} from "@/common/tenant/base-datos-tenant"
import {
  aplicarTransicion,
  type EstadoOrganizacion,
  TransicionInvalidaError,
} from "./dominio/transiciones"
import type { OrganizacionDto } from "./dto/organizacion.dto"
import type { CasoValidacionDto } from "./dto/validacion.dto"
import { traducirErrorDominio } from "./errores-dominio"
import { aDetalle, nombreVisible } from "./mapeo"

type DecisionAdministrador =
  { accion: "APROBAR" } | { accion: "DEVOLVER"; motivo: string }

/** Cola y decisiones del Administrador de la plataforma (R4.3–R4.5, R5.8). */
@Injectable()
export class ValidacionService {
  constructor(
    private readonly bd: BaseDatosTenant,
    private readonly auditoria: AuditoriaService,
  ) {}

  async cola(usuario: UsuarioActual): Promise<CasoValidacionDto[]> {
    const pendientes = await this.bd.ejecutarComo(
      { usuarioId: usuario.id, esAdmin: usuario.esAdmin },
      (tx) =>
        tx.organizacion.findMany({
          where: { estado: "EN_VALIDACION" },
          include: { _count: { select: { sedes: true } } },
          orderBy: { enviadaEn: "asc" },
        }),
    )
    return pendientes.map((o) => ({
      id: o.id,
      nombreVisible: nombreVisible(o),
      razonSocial: o.razonSocial,
      nit: o.nit,
      digitoVerificacion: o.digitoVerificacion,
      enviadaEn: o.enviadaEn,
      riesgoMaximo: o.riesgoMaximo,
      totalTrabajadores: o.totalTrabajadores,
      estandaresAplicables: o.estandaresAplicables,
      sedes: o._count.sedes,
    }))
  }

  aprobar(usuario: UsuarioActual, id: string): Promise<OrganizacionDto> {
    return this.decidir(usuario, id, { accion: "APROBAR" })
  }

  devolver(
    usuario: UsuarioActual,
    id: string,
    motivo: string,
  ): Promise<OrganizacionDto> {
    return this.decidir(usuario, id, { accion: "DEVOLVER", motivo })
  }

  private async decidir(
    usuario: UsuarioActual,
    id: string,
    decision: DecisionAdministrador,
  ): Promise<OrganizacionDto> {
    const contexto = { usuarioId: usuario.id, esAdmin: usuario.esAdmin }
    try {
      return await this.bd.ejecutarComo(contexto, (tx) =>
        this.aplicar(tx, usuario, id, decision),
      )
    } catch (error) {
      throw traducirErrorDominio(error)
    }
  }

  private async aplicar(
    tx: TransaccionBd,
    usuario: UsuarioActual,
    id: string,
    decision: DecisionAdministrador,
  ): Promise<OrganizacionDto> {
    const actual = await tx.organizacion.findUnique({ where: { id } })
    if (!actual) throw new NotFoundException()
    const rol = usuario.esAdmin ? "ADMINISTRADOR" : "LIDER_SST"
    const nuevo = aplicarTransicion(actual.estado, decision.accion, rol)
    const motivo = decision.accion === "DEVOLVER" ? decision.motivo : null
    await this.cambiarEstado(tx, id, actual.estado, nuevo, motivo)
    await this.auditoria.registrar(tx, usuario.id, {
      organizacionId: id,
      entidad: "Organizacion",
      entidadId: id,
      accion: decision.accion,
      valorAnterior: { estado: actual.estado },
      valorNuevo: { estado: nuevo },
      ...(motivo ? { motivo } : {}),
    })
    const organizacion = await tx.organizacion.findUniqueOrThrow({
      where: { id },
      include: { sedes: true },
    })
    return aDetalle(organizacion)
  }

  /** Condicionado al estado leído: si otra decisión llegó antes, 409. */
  private async cambiarEstado(
    tx: TransaccionBd,
    id: string,
    desde: EstadoOrganizacion,
    hacia: EstadoOrganizacion,
    motivoDevolucion: string | null,
  ): Promise<void> {
    const { count } = await tx.organizacion.updateMany({
      where: { id, estado: desde },
      data: { estado: hacia, motivoDevolucion },
    })
    if (count !== 1) {
      throw new TransicionInvalidaError("La organización cambió de estado")
    }
  }
}
