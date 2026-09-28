import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
  ApiUnsupportedMediaTypeResponse,
} from "@nestjs/swagger"

import type { UsuarioActual } from "@/common/auth/usuario-actual"
import { Usuario } from "@/common/auth/usuario.decorator"
import { CorreccionService } from "./correccion.service"
import { opcionesCarga } from "./documentos/archivo-recibido"
import { LimiteTamanoInterceptor } from "./documentos/limite-tamano.interceptor"
import {
  ArchivosDocumentosPipe,
  type ArchivosPorTipo,
  CAMPOS_DOCUMENTOS,
  DatosMultipartInterceptor,
} from "./documentos/registro-multipart"
import { OrganizacionDto } from "./dto/organizacion.dto"
import { RegistrarOrganizacionDto } from "./dto/registrar-organizacion.dto"
import { ListaOrganizacionesDto } from "./dto/tarjeta-organizacion.dto"
import { OrganizacionesService } from "./organizaciones.service"

@ApiTags("organizaciones")
@ApiExtraModels(RegistrarOrganizacionDto)
@Controller("organizaciones")
export class OrganizacionesController {
  constructor(
    private readonly organizaciones: OrganizacionesService,
    private readonly correccion: CorreccionService,
  ) {}

  @Post()
  @UseInterceptors(
    new LimiteTamanoInterceptor(),
    FileFieldsInterceptor(
      CAMPOS_DOCUMENTOS,
      opcionesCarga(CAMPOS_DOCUMENTOS.length),
    ),
    new DatosMultipartInterceptor(),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description:
      "DEC-4: datos = JSON de RegistrarOrganizacionDto; un archivo por tipo de documento",
    schema: {
      type: "object",
      required: [
        "datos",
        "RUT",
        "CAMARA_COMERCIO",
        "CEDULA_REP_LEGAL",
        "FORMULARIO_ARL",
      ],
      properties: {
        datos: {
          type: "string",
          description: "JSON de RegistrarOrganizacionDto",
        },
        ...Object.fromEntries(
          CAMPOS_DOCUMENTOS.map(({ name }) => [
            name,
            { type: "string", format: "binary" },
          ]),
        ),
      },
    },
  })
  @ApiCreatedResponse({ type: OrganizacionDto })
  @ApiBadRequestResponse({ description: "Campos inválidos en errores[].campo" })
  @ApiConflictResponse({ description: "El NIT ya está registrado (R1.7)" })
  @ApiPayloadTooLargeResponse({ description: "Un archivo supera 10 MB (R7.9)" })
  @ApiUnsupportedMediaTypeResponse({
    description: "Un archivo no es PDF ni imagen (R7.3)",
  })
  @ApiUnprocessableEntityResponse({
    description: "Faltan documentos obligatorios, en faltantes (R7.5)",
  })
  registrar(
    @Usuario() usuario: UsuarioActual,
    @Body() datos: RegistrarOrganizacionDto,
    @UploadedFiles(ArchivosDocumentosPipe) archivos: ArchivosPorTipo,
  ): Promise<OrganizacionDto> {
    return this.organizaciones.registrar(usuario, datos, archivos)
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
  @ApiUnprocessableEntityResponse({
    description: "Faltan documentos obligatorios, en faltantes (R7.5)",
  })
  reenviar(
    @Usuario() usuario: UsuarioActual,
    @Param("id") id: string,
  ): Promise<OrganizacionDto> {
    return this.correccion.reenviar(usuario, id)
  }
}
