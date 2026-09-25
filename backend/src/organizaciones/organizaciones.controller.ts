import { Body, Controller, Get, Param, Post } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger"

import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { Usuario } from "@/common/auth/usuario.decorator"
import { OrganizacionDto } from "./dto/organizacion.dto"
import { RegistrarOrganizacionDto } from "./dto/registrar-organizacion.dto"
import { ListaOrganizacionesDto } from "./dto/tarjeta-organizacion.dto"
import { OrganizacionesService } from "./organizaciones.service"

@ApiTags("organizaciones")
@Controller("organizaciones")
export class OrganizacionesController {
  constructor(private readonly organizaciones: OrganizacionesService) {}

  @Post()
  @ApiCreatedResponse({ type: OrganizacionDto })
  @ApiBadRequestResponse({ description: "Campos inválidos en errores[].campo" })
  @ApiConflictResponse({ description: "El NIT ya está registrado (R1.7)" })
  registrar(
    @Usuario() usuario: UsuarioActual,
    @Body() datos: RegistrarOrganizacionDto,
  ): Promise<OrganizacionDto> {
    return this.organizaciones.registrar(usuario, datos)
  }

  @Get()
  @ApiOkResponse({ type: ListaOrganizacionesDto })
  listar(@Usuario() usuario: UsuarioActual): Promise<ListaOrganizacionesDto> {
    return this.organizaciones.listarMias(usuario)
  }

  @Get(":id")
  @ApiOkResponse({ type: OrganizacionDto })
  @ApiNotFoundResponse({ description: "No existe o no es del usuario (R6.1)" })
  obtener(
    @Usuario() usuario: UsuarioActual,
    @Param("id") id: string,
  ): Promise<OrganizacionDto> {
    return this.organizaciones.obtener(usuario, id)
  }
}
