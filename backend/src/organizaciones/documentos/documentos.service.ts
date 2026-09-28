import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"

import { AuditoriaService } from "@/common/auditoria/auditoria.service"
import type { UsuarioActual } from "@/common/auth/usuario-actual"
import {
  BaseDatosTenant,
  type TransaccionBd,
} from "@/common/tenant/base-datos-tenant"
import type { DocumentoLegal } from "@/generated/prisma/client"
import { AlmacenamientoArchivos } from "@/infra/almacenamiento/almacenamiento-archivos"
import {
  DOCUMENTOS_LEGALES,
  type TipoDocumentoLegal,
  documentosFaltantes,
} from "@/organizaciones/dominio/documentos-legales"
import type {
  DocumentoLegalDto,
  ListaDocumentosDto,
  UrlDocumentoDto,
  VersionDocumentoDto,
} from "@/organizaciones/dto/documento.dto"
import { esUuid } from "@/organizaciones/persistencia"
import type { ArchivoDocumento } from "./archivo-recibido"

function contextoDe(usuario: UsuarioActual) {
  return { usuarioId: usuario.id, esAdmin: usuario.esAdmin }
}

function aVersion(documento: DocumentoLegal): VersionDocumentoDto {
  const { version, nombreArchivo, tipoMime, tamanoBytes, cargadoEn } = documento
  return { version, nombreArchivo, tipoMime, tamanoBytes, cargadoEn }
}

/** Clave del objeto: todas las versiones de un tipo comparten clave (R7.4). */
function claveObjeto(organizacionId: string, tipo: TipoDocumentoLegal) {
  return `organizaciones/${organizacionId}/${tipo}`
}

/** Documentos legales de una organización (R7.*, DEC-3, DEC-4). */
@Injectable()
export class DocumentosService {
  constructor(
    private readonly bd: BaseDatosTenant,
    private readonly almacenamiento: AlmacenamientoArchivos,
    private readonly auditoria: AuditoriaService,
  ) {}

  /** R7.1, R7.6, R7.7: versión vigente de cada tipo; RLS decide quién ve. */
  async listar(
    usuario: UsuarioActual,
    organizacionId: string,
  ): Promise<ListaDocumentosDto> {
    return this.bd.ejecutarComo(contextoDe(usuario), async (tx) => {
      await this.exigirVisible(tx, organizacionId)
      const vigentes = await this.vigentes(tx, organizacionId)
      const documentos: DocumentoLegalDto[] = DOCUMENTOS_LEGALES.map((d) => {
        const vigente = vigentes.get(d.tipo)
        return { ...d, vigente: vigente ? aVersion(vigente) : null }
      })
      return { documentos, faltantes: documentosFaltantes(vigentes.keys()) }
    })
  }

  /** R7.2–R7.4: carga una versión nueva; fuera de validación (design.md). */
  async cargar(
    usuario: UsuarioActual,
    organizacionId: string,
    tipo: TipoDocumentoLegal,
    archivo: ArchivoDocumento,
  ): Promise<VersionDocumentoDto> {
    if (usuario.esAdmin) {
      throw new ForbiddenException("Solo el Líder SST carga documentos")
    }
    return this.bd.ejecutarComo(contextoDe(usuario), async (tx) => {
      const estado = await this.exigirVisible(tx, organizacionId)
      if (estado === "EN_VALIDACION") {
        throw new ConflictException(
          "No se pueden cambiar documentos mientras la organización está En validación",
        )
      }
      const documento = await this.guardarVersion(
        tx,
        usuario.id,
        organizacionId,
        tipo,
        archivo,
      )
      return aVersion(documento)
    })
  }

  /** R7.6, R7.7: URL firmada de la versión vigente, tras pasar RLS. */
  async urlFirmada(
    usuario: UsuarioActual,
    organizacionId: string,
    tipo: TipoDocumentoLegal,
  ): Promise<UrlDocumentoDto> {
    if (!esUuid(organizacionId)) throw new NotFoundException()
    const documento = await this.bd.ejecutarComo(contextoDe(usuario), (tx) =>
      tx.documentoLegal.findFirst({
        where: { organizacionId, tipo },
        orderBy: { version: "desc" },
      }),
    )
    if (!documento) throw new NotFoundException()
    return this.almacenamiento.urlFirmada(
      documento.objetoClave,
      documento.objetoVersion,
      { nombreArchivo: documento.nombreArchivo, tipoMime: documento.tipoMime },
    )
  }

  /**
   * Guarda el archivo en MinIO y registra la versión siguiente, con su
   * auditoría, dentro de la transacción del llamador (registro, T24).
   */
  async guardarVersion(
    tx: TransaccionBd,
    usuarioId: string,
    organizacionId: string,
    tipo: TipoDocumentoLegal,
    archivo: ArchivoDocumento,
  ): Promise<DocumentoLegal> {
    const anterior = await tx.documentoLegal.findFirst({
      where: { organizacionId, tipo },
      orderBy: { version: "desc" },
      select: { version: true },
    })
    const version = (anterior?.version ?? 0) + 1
    const objetoClave = claveObjeto(organizacionId, tipo)
    const guardado = await this.almacenamiento.guardar({
      clave: objetoClave,
      contenido: archivo.contenido,
      tipoMime: archivo.tipoMime,
    })
    const documento = await tx.documentoLegal.create({
      data: {
        organizacionId,
        tipo,
        version,
        objetoClave,
        objetoVersion: guardado.version,
        nombreArchivo: archivo.nombreArchivo,
        tipoMime: archivo.tipoMime,
        tamanoBytes: archivo.tamanoBytes,
        cargadoPor: usuarioId,
      },
    })
    await this.auditoria.registrar(tx, usuarioId, {
      organizacionId,
      entidad: "DocumentoLegal",
      entidadId: documento.id,
      accion: "CARGAR_DOCUMENTO",
      valorAnterior: anterior ? { tipo, version: anterior.version } : undefined,
      valorNuevo: {
        tipo,
        version,
        tipoMime: archivo.tipoMime,
        tamanoBytes: archivo.tamanoBytes,
      },
    })
    return documento
  }

  /** R7.5: obligatorios que la organización aún no tiene. */
  async faltantes(
    tx: TransaccionBd,
    organizacionId: string,
  ): Promise<TipoDocumentoLegal[]> {
    const cargados = await tx.documentoLegal.findMany({
      where: { organizacionId },
      distinct: ["tipo"],
      select: { tipo: true },
    })
    return documentosFaltantes(cargados.map((d) => d.tipo))
  }

  /** R6.1: una organización ajena o inexistente responde 404. */
  private async exigirVisible(tx: TransaccionBd, organizacionId: string) {
    const organizacion = esUuid(organizacionId)
      ? await tx.organizacion.findUnique({
          where: { id: organizacionId },
          select: { estado: true },
        })
      : null
    if (!organizacion) throw new NotFoundException()
    return organizacion.estado
  }

  private async vigentes(tx: TransaccionBd, organizacionId: string) {
    const todas = await tx.documentoLegal.findMany({
      where: { organizacionId },
      orderBy: { version: "desc" },
    })
    const porTipo = new Map<TipoDocumentoLegal, DocumentoLegal>()
    for (const documento of todas) {
      if (!porTipo.has(documento.tipo)) porTipo.set(documento.tipo, documento)
    }
    return porTipo
  }
}
