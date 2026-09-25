import { Controller, Get, Param, Query } from "@nestjs/common"
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger"

import { CatalogosService } from "./catalogos.service"
import {
  ActividadCiiuDto,
  ArlDto,
  DepartamentoDto,
  MunicipioDto,
} from "./dto/catalogos.dto"

@ApiTags("catalogos")
@Controller("catalogos")
export class CatalogosController {
  constructor(private readonly catalogos: CatalogosService) {}

  @Get("departamentos")
  @ApiOkResponse({ type: [DepartamentoDto] })
  departamentos(): Promise<DepartamentoDto[]> {
    return this.catalogos.listarDepartamentos()
  }

  @Get("departamentos/:codigo/municipios")
  @ApiOkResponse({ type: [MunicipioDto] })
  municipios(@Param("codigo") codigo: string): Promise<MunicipioDto[]> {
    return this.catalogos.listarMunicipios(codigo)
  }

  @Get("ciiu")
  @ApiQuery({
    name: "q",
    required: false,
    description: "Código o palabra de la descripción",
  })
  @ApiOkResponse({ type: [ActividadCiiuDto] })
  ciiu(@Query("q") consulta?: string): Promise<ActividadCiiuDto[]> {
    return this.catalogos.buscarCiiu(consulta)
  }

  @Get("arl")
  @ApiOkResponse({ type: [ArlDto] })
  arl(): Promise<ArlDto[]> {
    return this.catalogos.listarArl()
  }
}
