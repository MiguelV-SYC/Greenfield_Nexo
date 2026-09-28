import { ApiProperty } from "@nestjs/swagger"

import {
  TIPOS_DOCUMENTO_LEGAL,
  type TipoDocumentoLegal,
} from "@/organizaciones/dominio/documentos-legales"

export class VersionDocumentoDto {
  @ApiProperty({
    description: "1 en la primera carga; sube con cada reemplazo (R7.4)",
  })
  version: number
  @ApiProperty() nombreArchivo: string
  @ApiProperty({
    enum: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  })
  tipoMime: string
  @ApiProperty() tamanoBytes: number
  @ApiProperty() cargadoEn: Date
}

/** Un tipo de documento legal y su versión vigente, si la hay (R7.1). */
export class DocumentoLegalDto {
  @ApiProperty({ enum: TIPOS_DOCUMENTO_LEGAL }) tipo: TipoDocumentoLegal
  @ApiProperty() nombre: string
  @ApiProperty() obligatorio: boolean
  @ApiProperty({ type: VersionDocumentoDto, nullable: true })
  vigente: VersionDocumentoDto | null
}

export class ListaDocumentosDto {
  @ApiProperty({ type: [DocumentoLegalDto] })
  documentos: DocumentoLegalDto[]
  @ApiProperty({
    enum: TIPOS_DOCUMENTO_LEGAL,
    isArray: true,
    description:
      "Obligatorios sin cargar: impiden el envío a validación (R7.5)",
  })
  faltantes: TipoDocumentoLegal[]
}

export class UrlDocumentoDto {
  @ApiProperty({ description: "URL firmada de corta duración (R7.7)" })
  url: string
  @ApiProperty() expiraEn: Date
}
