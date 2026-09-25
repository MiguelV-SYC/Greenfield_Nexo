import { Body, Controller, HttpCode, Post } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"

import { calcularEstandaresAplicables } from "./dominio/estandares-aplicables"
import {
  CalculoEstandaresDto,
  EstandaresAplicablesDto,
} from "./dto/estandares.dto"

/** Vista previa del asistente (R3.6, DEC-5): no persiste nada. */
@ApiTags("organizaciones")
@Controller("estandares-aplicables")
export class EstandaresController {
  @Post("calculo")
  @HttpCode(200)
  @ApiOkResponse({ type: EstandaresAplicablesDto })
  calcular(@Body() cuerpo: CalculoEstandaresDto): EstandaresAplicablesDto {
    return calcularEstandaresAplicables(cuerpo.sedes)
  }
}
