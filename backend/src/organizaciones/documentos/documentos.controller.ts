import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnsupportedMediaTypeResponse,
} from "@nestjs/swagger"

import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { Usuario } from "@/common/auth/usuario.decorator"
import {
  TIPOS_DOCUMENTO_LEGAL,
  type TipoDocumentoLegal,
} from "@/organizaciones/dominio/documentos-legales"
import {
  ListaDocumentosDto,
  UrlDocumentoDto,
  VersionDocumentoDto,
} from "@/organizaciones/dto/documento.dto"
import {
  type ArchivoDocumento,
  ArchivoDocumentoPipe,
  opcionesCarga,
} from "./archivo-recibido"
import { DocumentosService } from "./documentos.service"
import { LimiteTamanoInterceptor } from "./limite-tamano.interceptor"

const TIPOS = Object.fromEntries(TIPOS_DOCUMENTO_LEGAL.map((t) => [t, t]))
const tipoValido = () => new ParseEnumPipe(TIPOS)

@ApiTags("documentos")
@ApiNotFoundResponse({ description: "No existe o no es del usuario (R6.1)" })
@Controller("organizaciones/:id/documentos")
export class DocumentosController {
  constructor(private readonly documentos: DocumentosService) {}

  @Get()
  @ApiOkResponse({ type: ListaDocumentosDto })
  listar(
    @Usuario() usuario: UsuarioActual,
    @Param("id") id: string,
  ): Promise<ListaDocumentosDto> {
    return this.documentos.listar(usuario, id)
  }

  @Put(":tipo")
  @UseInterceptors(
    new LimiteTamanoInterceptor(),
    FileInterceptor("archivo", opcionesCarga(1)),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["archivo"],
      properties: { archivo: { type: "string", format: "binary" } },
    },
  })
  @ApiOkResponse({ type: VersionDocumentoDto })
  @ApiForbiddenResponse({ description: "Solo el Líder SST carga documentos" })
  @ApiConflictResponse({ description: "La organización está En validación" })
  @ApiPayloadTooLargeResponse({ description: "Más de 10 MB (R7.9)" })
  @ApiUnsupportedMediaTypeResponse({
    description: "No es PDF ni imagen (R7.3)",
  })
  cargar(
    @Usuario() usuario: UsuarioActual,
    @Param("id") id: string,
    @Param("tipo", tipoValido()) tipo: TipoDocumentoLegal,
    @UploadedFile(ArchivoDocumentoPipe) archivo: ArchivoDocumento,
  ): Promise<VersionDocumentoDto> {
    return this.documentos.cargar(usuario, id, tipo, archivo)
  }

  @Get(":tipo/url")
  @ApiOkResponse({ type: UrlDocumentoDto })
  url(
    @Usuario() usuario: UsuarioActual,
    @Param("id") id: string,
    @Param("tipo", tipoValido()) tipo: TipoDocumentoLegal,
  ): Promise<UrlDocumentoDto> {
    return this.documentos.urlFirmada(usuario, id, tipo)
  }
}
