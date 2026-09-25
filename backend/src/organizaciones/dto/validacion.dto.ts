import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, MaxLength } from "class-validator"

import { Recortar } from "@/common/validacion/recortar"
import type { ClaseRiesgo } from "@/organizaciones/dominio/estandares-aplicables"
import { CLASES_RIESGO } from "./estandares.dto"

export class DevolucionDto {
  @ApiProperty({ example: "El RUT no corresponde a la razón social" })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motivo: string
}

/** Fila de la cola de validación del Administrador (R5.8). */
export class CasoValidacionDto {
  @ApiProperty({ format: "uuid" }) id: string
  @ApiProperty() nombreVisible: string
  @ApiProperty() razonSocial: string
  @ApiProperty() nit: string
  @ApiProperty() digitoVerificacion: string
  @ApiProperty() enviadaEn: Date
  @ApiProperty({ enum: CLASES_RIESGO }) riesgoMaximo: ClaseRiesgo
  @ApiProperty() totalTrabajadores: number
  @ApiProperty({ enum: [7, 21, 62] }) estandaresAplicables: number
  @ApiProperty({ description: "Número de sedes" }) sedes: number
}
