import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common"
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger"

import { SoloAdministradorGuard } from "@/common/auth/guards"
import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { Usuario } from "@/common/auth/usuario.decorator"
import { OrganizacionDto } from "./dto/organizacion.dto"
import { CasoValidacionDto, DevolucionDto } from "./dto/validacion.dto"
import { ValidacionService } from "./validacion.service"

@ApiTags("admin")
@ApiForbiddenResponse({
  description: "Solo el Administrador de la plataforma (R4.9)",
})
@UseGuards(SoloAdministradorGuard)
@Controller("admin/organizaciones")
export class AdminValidacionController {
  constructor(private readonly validacion: ValidacionService) {}

  @Get("validacion")
  @ApiOkResponse({ type: [CasoValidacionDto] })
  cola(@Usuario() usuario: UsuarioActual): Promise<CasoValidacionDto[]> {
    return this.validacion.cola(usuario)
  }

  @Post(":id/aprobacion")
  @HttpCode(200)
  @ApiOkResponse({ type: OrganizacionDto })
  @ApiConflictResponse({ description: "No está En validación (R4.10)" })
  aprobar(
    @Usuario() usuario: UsuarioActual,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<OrganizacionDto> {
    return this.validacion.aprobar(usuario, id)
  }

  @Post(":id/devolucion")
  @HttpCode(200)
  @ApiOkResponse({ type: OrganizacionDto })
  @ApiConflictResponse({ description: "No está En validación (R4.10)" })
  devolver(
    @Usuario() usuario: UsuarioActual,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() cuerpo: DevolucionDto,
  ): Promise<OrganizacionDto> {
    return this.validacion.devolver(usuario, id, cuerpo.motivo)
  }
}
