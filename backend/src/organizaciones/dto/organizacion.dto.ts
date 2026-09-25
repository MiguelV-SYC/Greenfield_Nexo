import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

import type { ClaseRiesgo } from "@/organizaciones/dominio/estandares-aplicables"
import type { EstadoOrganizacion } from "@/organizaciones/dominio/transiciones"
import { CLASES_RIESGO } from "./estandares.dto"
import {
  SedeDto,
  TIPOS_DOCUMENTO,
  TIPOS_PERSONA,
} from "./registrar-organizacion.dto"

export const ESTADOS = ["EN_VALIDACION", "DEVUELTA", "APROBADA"] as const

export class SedeRegistradaDto extends SedeDto {
  @ApiProperty({ format: "uuid" }) id: string
}

/** Detalle de una organización (R5.9). */
export class OrganizacionDto {
  @ApiProperty({ format: "uuid" }) id: string
  @ApiProperty() razonSocial: string
  @ApiPropertyOptional({ nullable: true, type: String })
  nombreComercial: string | null
  @ApiProperty({
    description: "Nombre comercial o, si falta, la razón social (R1.8)",
  })
  nombreVisible: string
  @ApiProperty({ enum: TIPOS_PERSONA })
  tipoPersona: (typeof TIPOS_PERSONA)[number]
  @ApiProperty() nit: string
  @ApiProperty() digitoVerificacion: string
  @ApiProperty() repLegalNombre: string
  @ApiPropertyOptional({ enum: TIPOS_DOCUMENTO, nullable: true })
  repLegalTipoDoc: (typeof TIPOS_DOCUMENTO)[number] | null
  @ApiPropertyOptional({ nullable: true, type: String })
  repLegalNumeroDoc: string | null
  @ApiPropertyOptional({ nullable: true, type: String }) arlCodigo:
    string | null
  @ApiProperty({ enum: ESTADOS }) estado: EstadoOrganizacion
  @ApiPropertyOptional({ nullable: true, type: String })
  motivoDevolucion: string | null
  @ApiProperty() enviadaEn: Date
  @ApiProperty({ enum: CLASES_RIESGO }) riesgoMaximo: ClaseRiesgo
  @ApiProperty() totalTrabajadores: number
  @ApiProperty({ enum: [7, 21, 62] }) estandaresAplicables: number
  @ApiProperty({ type: [SedeRegistradaDto] }) sedes: SedeRegistradaDto[]
}
