import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator"

import { Recortar } from "@/common/validacion/recortar"
import type { ClaseRiesgo } from "@/organizaciones/dominio/estandares-aplicables"
import { CLASES_RIESGO } from "./estandares.dto"

export const TIPOS_PERSONA = ["JURIDICA", "NATURAL"] as const
export const TIPOS_DOCUMENTO = ["CC", "CE", "PASAPORTE"] as const

const TEXTO_MAXIMO = 200

export class SedeDto {
  @ApiProperty({ example: "Oficina principal" })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXTO_MAXIMO)
  nombre: string

  @ApiProperty({ example: "Calle 36 # 27-52" })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXTO_MAXIMO)
  direccion: string

  @ApiProperty({ example: "68", description: "Código DANE (DIVIPOLA)" })
  @IsString()
  @IsNotEmpty()
  departamentoCodigo: string

  @ApiProperty({ example: "68001", description: "Código DANE (DIVIPOLA)" })
  @IsString()
  @IsNotEmpty()
  municipioCodigo: string

  @ApiProperty({ enum: CLASES_RIESGO, example: "II" })
  @IsIn(CLASES_RIESGO)
  claseRiesgo: ClaseRiesgo

  @ApiProperty({ example: 12, minimum: 1 })
  @IsInt()
  @Min(1)
  trabajadores: number

  @ApiProperty({ example: "6201", description: "Código CIIU" })
  @IsString()
  @IsNotEmpty()
  ciiuCodigo: string
}

export class RegistrarOrganizacionDto {
  @ApiProperty({ example: "Sistemas y Computadores S.A." })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXTO_MAXIMO)
  razonSocial: string

  @ApiPropertyOptional({ example: "SYC" })
  @Recortar()
  @IsOptional()
  @IsString()
  @MaxLength(TEXTO_MAXIMO)
  nombreComercial?: string

  @ApiProperty({ enum: TIPOS_PERSONA, example: "JURIDICA" })
  @IsIn(TIPOS_PERSONA)
  tipoPersona: (typeof TIPOS_PERSONA)[number]

  @ApiProperty({ example: "800197268", description: "Solo dígitos, sin DV" })
  @IsString()
  @Matches(/^\d{1,15}$/, { message: "nit debe tener solo dígitos (máximo 15)" })
  nit: string

  @ApiProperty({ example: "4" })
  @IsString()
  @Matches(/^\d$/, { message: "digitoVerificacion debe ser un dígito" })
  digitoVerificacion: string

  @ApiProperty({ example: "Nombre del representante legal" })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXTO_MAXIMO)
  repLegalNombre: string

  @ApiPropertyOptional({ enum: TIPOS_DOCUMENTO })
  @IsOptional()
  @IsIn(TIPOS_DOCUMENTO)
  repLegalTipoDoc?: (typeof TIPOS_DOCUMENTO)[number]

  @ApiPropertyOptional({ example: "1234567" })
  @Recortar()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  repLegalNumeroDoc?: string

  @ApiPropertyOptional({
    example: "aurora",
    description: "Código del catálogo de ARL",
  })
  @IsOptional()
  @IsString()
  arlCodigo?: string

  @ApiProperty({ type: [SedeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SedeDto)
  sedes: SedeDto[]
}
