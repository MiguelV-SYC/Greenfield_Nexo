import { randomUUID } from "node:crypto"

import {
  DeleteObjectCommand,
  GetBucketVersioningCommand,
  GetObjectLockConfigurationCommand,
  ListObjectVersionsCommand,
  S3Client,
} from "@aws-sdk/client-s3"

import { AlmacenamientoMinio } from "@/infra/almacenamiento/almacenamiento-minio"
import {
  type ConfiguracionAlmacenamiento,
  leerConfiguracionAlmacenamiento,
} from "@/infra/almacenamiento/configuracion-almacenamiento"

// stack/testing.md: el adaptador se prueba contra el MinIO de Compose, con
// las credenciales de la aplicación (usuario nexo-app de infra/minio).
describe("Almacenamiento de documentos en MinIO (T21)", () => {
  let configuracion: ConfiguracionAlmacenamiento
  let almacenamiento: AlmacenamientoMinio
  let s3: S3Client

  beforeAll(() => {
    configuracion = leerConfiguracionAlmacenamiento()
    almacenamiento = new AlmacenamientoMinio(configuracion)
    s3 = new S3Client({
      endpoint: configuracion.endpoint,
      region: "us-east-1",
      forcePathStyle: true,
      credentials: {
        accessKeyId: configuracion.accessKey,
        secretAccessKey: configuracion.secretKey,
      },
    })
  })

  afterAll(() => s3.destroy())

  const clave = () => `pruebas/${randomUUID()}/RUT`
  const pdf = (texto: string) => Buffer.from(`%PDF-1.7\n${texto}\n%%EOF`)

  // Derived from NFR5, R7.8 y DEC-3
  it("el bucket tiene versionado y Object Lock GOVERNANCE de 20 años", async () => {
    const versionado = await s3.send(
      new GetBucketVersioningCommand({ Bucket: configuracion.bucket }),
    )
    const bloqueo = await s3.send(
      new GetObjectLockConfigurationCommand({ Bucket: configuracion.bucket }),
    )
    expect(versionado.Status).toBe("Enabled")
    expect(bloqueo.ObjectLockConfiguration).toEqual({
      ObjectLockEnabled: "Enabled",
      Rule: { DefaultRetention: { Mode: "GOVERNANCE", Years: 20 } },
    })
  })

  // Derived from R7.4
  it("guardar dos veces la misma clave conserva ambas versiones", async () => {
    const k = clave()
    const v1 = await almacenamiento.guardar({
      clave: k,
      contenido: pdf("uno"),
      tipoMime: "application/pdf",
    })
    const v2 = await almacenamiento.guardar({
      clave: k,
      contenido: pdf("dos"),
      tipoMime: "application/pdf",
    })
    expect(v1.version).not.toBe(v2.version)
    const versiones = await s3.send(
      new ListObjectVersionsCommand({ Bucket: configuracion.bucket, Prefix: k }),
    )
    expect(versiones.Versions?.map((v) => v.VersionId).sort()).toEqual(
      [v1.version, v2.version].sort(),
    )
  })

  // Derived from R7.8
  it("la aplicación no puede borrar un documento ni una versión", async () => {
    const k = clave()
    const { version } = await almacenamiento.guardar({
      clave: k,
      contenido: pdf("no borrar"),
      tipoMime: "application/pdf",
    })
    await expect(
      s3.send(
        new DeleteObjectCommand({
          Bucket: configuracion.bucket,
          Key: k,
          VersionId: version,
          BypassGovernanceRetention: true,
        }),
      ),
    ).rejects.toMatchObject({ name: "AccessDenied" })
    await expect(
      s3.send(new DeleteObjectCommand({ Bucket: configuracion.bucket, Key: k })),
    ).rejects.toMatchObject({ name: "AccessDenied" })
  })

  // Derived from R7.7
  it("la URL firmada entrega la versión pedida y caduca", async () => {
    const k = clave()
    const { version } = await almacenamiento.guardar({
      clave: k,
      contenido: pdf("primera"),
      tipoMime: "application/pdf",
    })
    await almacenamiento.guardar({
      clave: k,
      contenido: pdf("segunda"),
      tipoMime: "application/pdf",
    })
    const url = await almacenamiento.urlFirmada(k, version, {
      nombreArchivo: "rut año.pdf",
      tipoMime: "application/pdf",
    })
    expect(new URL(url).searchParams.get("X-Amz-Expires")).toBe("300")
    const respuesta = await fetch(url)
    expect(respuesta.status).toBe(200)
    expect(respuesta.headers.get("content-type")).toBe("application/pdf")
    expect(respuesta.headers.get("content-disposition")).toContain(
      "rut%20a%C3%B1o.pdf",
    )
    expect(await respuesta.text()).toContain("primera")
  })
})
