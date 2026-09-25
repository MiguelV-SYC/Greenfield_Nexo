import { randomUUID } from "node:crypto"

import { ConflictException, Injectable } from "@nestjs/common"

import { AuditoriaService } from "@/common/auditoria/auditoria.service"
import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { PrismaService } from "@/common/prisma/prisma.service"
import {
  BaseDatosTenant,
  type TransaccionBd,
} from "@/common/tenant/base-datos-tenant"
import { excepcionDeCampos } from "@/common/validacion/errores-validacion"
import { Prisma } from "@/generated/prisma/client"
import { calcularEstandaresAplicables } from "./dominio/estandares-aplicables"
import type { OrganizacionDto } from "./dto/organizacion.dto"
import type { RegistrarOrganizacionDto } from "./dto/registrar-organizacion.dto"
import { aDetalle } from "./mapeo"
import { validarReferencias } from "./referencias"

function esNitDuplicado(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

@Injectable()
export class OrganizacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bd: BaseDatosTenant,
    private readonly auditoria: AuditoriaService,
  ) {}

  /** R1–R4.2: registra y deja la organización En validación. */
  async registrar(
    usuario: UsuarioActual,
    datos: RegistrarOrganizacionDto,
  ): Promise<OrganizacionDto> {
    const errores = await validarReferencias(this.prisma, datos)
    if (errores.length > 0) throw excepcionDeCampos(errores)
    const id = randomUUID()
    const contexto = {
      usuarioId: usuario.id,
      esAdmin: usuario.esAdmin,
      organizacionNueva: id,
    }
    try {
      return await this.bd.ejecutarComo(contexto, (tx) =>
        this.crear(tx, id, usuario, datos),
      )
    } catch (error) {
      // R1.7: el NIT es único entre organizaciones en cualquier estado.
      if (esNitDuplicado(error))
        throw new ConflictException("El NIT ya está registrado")
      throw error
    }
  }

  private async crear(
    tx: TransaccionBd,
    id: string,
    usuario: UsuarioActual,
    { sedes, ...datos }: RegistrarOrganizacionDto,
  ): Promise<OrganizacionDto> {
    const { estandares, riesgoMaximo, totalTrabajadores } =
      calcularEstandaresAplicables(sedes)
    // Sin RETURNING: la membresía, que la hace visible por RLS, se crea después (0002_rls).
    await tx.organizacion.createMany({
      data: [
        {
          id,
          ...datos,
          estado: "EN_VALIDACION",
          enviadaEn: new Date(),
          riesgoMaximo,
          totalTrabajadores,
          estandaresAplicables: estandares,
        },
      ],
    })
    await tx.miembroOrganizacion.create({
      data: { organizacionId: id, usuarioId: usuario.id, rol: "LIDER_SST" },
    })
    await tx.sede.createMany({
      data: sedes.map((sede) => ({ ...sede, organizacionId: id })),
    })
    const organizacion = await tx.organizacion.findUniqueOrThrow({
      where: { id },
      include: { sedes: true },
    })
    const detalle = aDetalle(organizacion)
    await this.auditoria.registrar(tx, usuario.id, {
      organizacionId: id,
      entidad: "Organizacion",
      entidadId: id,
      accion: "REGISTRAR",
      valorNuevo: JSON.parse(JSON.stringify(detalle)),
    })
    return detalle
  }
}
