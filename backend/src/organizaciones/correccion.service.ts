import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"

import { AuditoriaService } from "@/common/auditoria/auditoria.service"
import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { PrismaService } from "@/common/prisma/prisma.service"
import {
  BaseDatosTenant,
  type TransaccionBd,
} from "@/common/tenant/base-datos-tenant"
import { excepcionDeCampos } from "@/common/validacion/errores-validacion"
import type { Prisma } from "@/generated/prisma/client"
import { calcularEstandaresAplicables } from "./dominio/estandares-aplicables"
import { aplicarTransicion, type RolActor } from "./dominio/transiciones"
import type { OrganizacionDto } from "./dto/organizacion.dto"
import type { RegistrarOrganizacionDto } from "./dto/registrar-organizacion.dto"
import { traducirErrorDominio } from "./errores-dominio"
import { aDetalle } from "./mapeo"
import {
  actualizarSiSigueEn,
  esNitDuplicado,
  esUuid,
  instantanea,
  leerDetalle,
} from "./persistencia"
import { validarReferencias } from "./referencias"

function rolDe(usuario: UsuarioActual): RolActor {
  return usuario.esAdmin ? "ADMINISTRADOR" : "LIDER_SST"
}

function traducir(error: unknown): unknown {
  if (esNitDuplicado(error)) {
    return new ConflictException("El NIT ya está registrado")
  }
  return traducirErrorDominio(error)
}

/** Ciclo del Líder SST sobre una organización devuelta (R4.6–R4.8). */
@Injectable()
export class CorreccionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bd: BaseDatosTenant,
    private readonly auditoria: AuditoriaService,
  ) {}

  /** R4.6: reemplaza datos y sedes; el NIT se puede corregir (R8.6). */
  async corregir(
    usuario: UsuarioActual,
    id: string,
    datos: RegistrarOrganizacionDto,
  ): Promise<OrganizacionDto> {
    if (!esUuid(id)) throw new NotFoundException()
    const errores = await validarReferencias(this.prisma, datos)
    if (errores.length > 0) throw excepcionDeCampos(errores)
    return this.ejecutar(usuario, (tx) =>
      this.reemplazar(tx, usuario, id, datos),
    )
  }

  /** R4.7: vuelve a validación con nueva fecha de envío, sin límite. */
  async reenviar(usuario: UsuarioActual, id: string): Promise<OrganizacionDto> {
    if (!esUuid(id)) throw new NotFoundException()
    return this.ejecutar(usuario, async (tx) => {
      const actual = await this.leer(tx, id)
      const nuevo = aplicarTransicion(actual.estado, "REENVIAR", rolDe(usuario))
      await actualizarSiSigueEn(tx, id, actual.estado, {
        estado: nuevo,
        enviadaEn: new Date(),
        motivoDevolucion: null,
      })
      await this.auditar(
        tx,
        usuario,
        id,
        "REENVIAR",
        { estado: actual.estado },
        { estado: nuevo },
      )
      return leerDetalle(tx, id)
    })
  }

  private async ejecutar<T>(
    usuario: UsuarioActual,
    trabajo: (tx: TransaccionBd) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.bd.ejecutarComo(
        { usuarioId: usuario.id, esAdmin: usuario.esAdmin },
        trabajo,
      )
    } catch (error) {
      throw traducir(error)
    }
  }

  private async leer(tx: TransaccionBd, id: string) {
    const actual = await tx.organizacion.findUnique({
      where: { id },
      include: { sedes: true },
    })
    if (!actual) throw new NotFoundException()
    return actual
  }

  private async reemplazar(
    tx: TransaccionBd,
    usuario: UsuarioActual,
    id: string,
    { sedes, ...datos }: RegistrarOrganizacionDto,
  ): Promise<OrganizacionDto> {
    const actual = await this.leer(tx, id)
    aplicarTransicion(actual.estado, "CORREGIR", rolDe(usuario))
    const { estandares, riesgoMaximo, totalTrabajadores } =
      calcularEstandaresAplicables(sedes)
    await actualizarSiSigueEn(tx, id, actual.estado, {
      nombreComercial: null,
      arlCodigo: null,
      repLegalTipoDoc: null,
      repLegalNumeroDoc: null,
      ...datos,
      riesgoMaximo,
      totalTrabajadores,
      estandaresAplicables: estandares,
    })
    await tx.sede.deleteMany({ where: { organizacionId: id } })
    await tx.sede.createMany({
      data: sedes.map((sede) => ({ ...sede, organizacionId: id })),
    })
    const detalle = await leerDetalle(tx, id)
    const antes = instantanea(aDetalle(actual))
    await this.auditar(tx, usuario, id, "CORREGIR", antes, instantanea(detalle))
    return detalle
  }

  private auditar(
    tx: TransaccionBd,
    usuario: UsuarioActual,
    id: string,
    accion: "CORREGIR" | "REENVIAR",
    valorAnterior: Prisma.InputJsonValue,
    valorNuevo: Prisma.InputJsonValue,
  ): Promise<void> {
    return this.auditoria.registrar(tx, usuario.id, {
      organizacionId: id,
      entidad: "Organizacion",
      entidadId: id,
      accion,
      valorAnterior,
      valorNuevo,
    })
  }
}
