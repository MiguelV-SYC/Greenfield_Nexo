import { Injectable, NotFoundException } from "@nestjs/common"

import { PrismaService } from "@/common/prisma/prisma.service"
import type {
  ActividadCiiuDto,
  ArlDto,
  DepartamentoDto,
  MunicipioDto,
} from "./dto/catalogos.dto"

export const MAXIMO_RESULTADOS_CIIU = 20

/** Catálogos globales: sin organización ni RLS; nexo_app solo los lee (DEC-7). */
@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) {}

  listarDepartamentos(): Promise<DepartamentoDto[]> {
    return this.prisma.departamento.findMany({
      select: { codigo: true, nombre: true },
      orderBy: { nombre: "asc" },
    })
  }

  async listarMunicipios(departamentoCodigo: string): Promise<MunicipioDto[]> {
    const departamento = await this.prisma.departamento.findUnique({
      where: { codigo: departamentoCodigo },
      select: { codigo: true },
    })
    if (!departamento) throw new NotFoundException()
    return this.prisma.municipio.findMany({
      where: { departamentoCodigo },
      select: { codigo: true, nombre: true },
      orderBy: { nombre: "asc" },
    })
  }

  /** R2.7: por prefijo de código o por palabra de la descripción. */
  buscarCiiu(consulta: string | undefined): Promise<ActividadCiiuDto[]> {
    const texto = consulta?.trim() ?? ""
    if (texto === "") return Promise.resolve([])
    return this.prisma.actividadCiiu.findMany({
      where: {
        OR: [
          { codigo: { startsWith: texto } },
          { descripcion: { contains: texto, mode: "insensitive" } },
        ],
      },
      orderBy: { codigo: "asc" },
      take: MAXIMO_RESULTADOS_CIIU,
    })
  }

  listarArl(): Promise<ArlDto[]> {
    return this.prisma.arl.findMany({
      select: { codigo: true, nombre: true },
      orderBy: { nombre: "asc" },
    })
  }
}
