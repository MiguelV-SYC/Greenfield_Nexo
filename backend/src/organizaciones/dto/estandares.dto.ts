import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  Min,
  ValidateNested,
} from "class-validator"

import type { ClaseRiesgo } from "@/organizaciones/dominio/estandares-aplicables"

export const CLASES_RIESGO: ClaseRiesgo[] = ["I", "II", "III", "IV", "V"]

export class SedeRiesgoDto {
  @ApiProperty({ enum: CLASES_RIESGO, example: "III" })
  @IsIn(CLASES_RIESGO)
  claseRiesgo: ClaseRiesgo

  @ApiProperty({ example: 12, minimum: 1 })
  @IsInt()
  @Min(1)
  trabajadores: number
}

export class CalculoEstandaresDto {
  @ApiProperty({ type: [SedeRiesgoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SedeRiesgoDto)
  sedes: SedeRiesgoDto[]
}

export class EstandaresAplicablesDto {
  @ApiProperty({ enum: [7, 21, 62], example: 21 }) estandares: 7 | 21 | 62
  @ApiProperty({ enum: CLASES_RIESGO, example: "III" })
  riesgoMaximo: ClaseRiesgo
  @ApiProperty({ example: 12 }) totalTrabajadores: number
  @ApiProperty({
    example: "Entre 11 y 50 trabajadores con riesgo máximo I, II o III",
  })
  regla: string
}
