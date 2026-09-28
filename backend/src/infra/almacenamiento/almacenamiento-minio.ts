import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import {
  AlmacenamientoArchivos,
  type ArchivoAGuardar,
  type OpcionesUrlFirmada,
  type UrlFirmada,
} from "./almacenamiento-archivos"
import type { ConfiguracionAlmacenamiento } from "./configuracion-almacenamiento"

/**
 * Adaptador S3 para MinIO. El bucket tiene versionado y Object Lock
 * GOVERNANCE de 20 años (DEC-3, infra/minio/preparar.sh); las credenciales
 * de la aplicación no pueden borrar objetos ni versiones (R7.8, NFR5).
 */
export class AlmacenamientoMinio extends AlmacenamientoArchivos {
  private readonly cliente: S3Client

  constructor(private readonly configuracion: ConfiguracionAlmacenamiento) {
    super()
    this.cliente = new S3Client({
      endpoint: configuracion.endpoint,
      region: "us-east-1",
      forcePathStyle: true,
      credentials: {
        accessKeyId: configuracion.accessKey,
        secretAccessKey: configuracion.secretKey,
      },
    })
  }

  async guardar({
    clave,
    contenido,
    tipoMime,
  }: ArchivoAGuardar): Promise<{ version: string }> {
    const respuesta = await this.cliente.send(
      new PutObjectCommand({
        Bucket: this.configuracion.bucket,
        Key: clave,
        Body: contenido,
        ContentType: tipoMime,
      }),
    )
    if (!respuesta.VersionId) {
      throw new Error("El bucket de documentos no tiene versionado (DEC-3)")
    }
    return { version: respuesta.VersionId }
  }

  async urlFirmada(
    clave: string,
    version: string,
    { nombreArchivo, tipoMime }: OpcionesUrlFirmada,
  ): Promise<UrlFirmada> {
    const comando = new GetObjectCommand({
      Bucket: this.configuracion.bucket,
      Key: clave,
      VersionId: version,
      ResponseContentType: tipoMime,
      ResponseContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(nombreArchivo)}`,
    })
    const vigencia = this.configuracion.ttlUrlFirmadaSegundos
    const expiraEn = new Date(Date.now() + vigencia * 1000)
    const url = await getSignedUrl(this.cliente, comando, {
      expiresIn: vigencia,
    })
    return { url, expiraEn }
  }
}
