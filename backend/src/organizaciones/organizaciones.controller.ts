import { Body, Controller, Post } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from "@nestjs/swagger"

import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { Usuario } from "@/common/auth/usuario.decorator"
import { OrganizacionDto } from "./dto/organizacion.dto"
import { RegistrarOrganizacionDto } from "./dto/registrar-organizacion.dto"
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
}
