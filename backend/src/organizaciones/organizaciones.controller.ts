import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger"

import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { Usuario } from "@/common/auth/usuario.decorator"
import { CorreccionService } from "./correccion.service"
import { OrganizacionDto } from "./dto/organizacion.dto"
import { RegistrarOrganizacionDto } from "./dto/registrar-organizacion.dto"
import { ListaOrganizacionesDto } from "./dto/tarjeta-organizacion.dto"
import { OrganizacionesService } from "./organizaciones.service"

@ApiTags("organizaciones")
@Controller("organizaciones")
export class OrganizacionesController {
  constructor(
    private readonly organizaciones: OrganizacionesService,
    private readonly correccion: CorreccionService,
  ) {}

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

  @Put(":id")
  @ApiOkResponse({ type: OrganizacionDto })
  @ApiBadRequestResponse({ description: "Campos inválidos en errores[].campo" })
  @ApiForbiddenResponse({ description: "Solo el Líder SST corrige (R4.6)" })
  @ApiNotFoundResponse({ description: "No existe o no es del usuario (R6.1)" })
  @ApiConflictResponse({
    description: "No está Devuelta (R4.8) o NIT registrado",
  })
  corregir(
    @Usuario() usuario: UsuarioActual,
    @Param("id") id: string,
    @Body() datos: RegistrarOrganizacionDto,
  ): Promise<OrganizacionDto> {
    return this.correccion.corregir(usuario, id, datos)
  }

  @Post(":id/reenvio")
  @HttpCode(200)
  @ApiOkResponse({ type: OrganizacionDto })
  @ApiForbiddenResponse({ description: "Solo el Líder SST reenvía (R4.7)" })
  @ApiNotFoundResponse({ description: "No existe o no es del usuario (R6.1)" })
  @ApiConflictResponse({ description: "No está Devuelta" })
  reenviar(
    @Usuario() usuario: UsuarioActual,
    @Param("id") id: string,
  ): Promise<OrganizacionDto> {
    return this.correccion.reenviar(usuario, id)
  }
}
