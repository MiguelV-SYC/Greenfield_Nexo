import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

import type { ClaseRiesgo } from "@/organizaciones/dominio/estandares-aplicables"
import type { EstadoOrganizacion } from "@/organizaciones/dominio/transiciones"
import { ArlDto } from "@/organizaciones/catalogos/dto/catalogos.dto"
import { CLASES_RIESGO } from "./estandares.dto"
import { ESTADOS } from "./organizacion.dto"

/** Tarjeta de "Mis organizaciones" (R5.2). */
export class TarjetaOrganizacionDto {
  @ApiProperty({ format: "uuid" }) id: string
  @ApiProperty({ description: "Nombre comercial o razón social (R1.8)" })
  nombreVisible: string
  @ApiProperty({ enum: ESTADOS }) estado: EstadoOrganizacion
  @ApiProperty({ enum: CLASES_RIESGO }) riesgoMaximo: ClaseRiesgo
  @ApiPropertyOptional({ type: ArlDto, nullable: true }) arl: ArlDto | null
  @ApiProperty() totalTrabajadores: number
  @ApiProperty({ enum: [7, 21, 62] }) estandaresAplicables: number
  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: "null = Sin evaluar mientras D2 esté en MOCK (R5.3)",
  })
  porcentajeImplementacion: number | null
  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: "Ídem (R5.3)",
  })
  porcentajeCumplimiento: number | null
  @ApiProperty({ description: "Solo true si está Aprobada (R5.4, DEC-12)" })
  puedeIngresar: boolean
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: "Solo si está Devuelta (R5.5)",
  })
  motivoDevolucion: string | null
}

export class ListaOrganizacionesDto {
  @ApiProperty({ description: "Organizaciones del usuario (R5.7)" })
  total: number
  @ApiProperty({ type: [TarjetaOrganizacionDto] })
  organizaciones: TarjetaOrganizacionDto[]
}
