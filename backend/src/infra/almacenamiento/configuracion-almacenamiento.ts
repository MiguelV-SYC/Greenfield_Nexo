export interface ConfiguracionAlmacenamiento {
  endpoint: string
  bucket: string
  accessKey: string
  secretKey: string
  ttlUrlFirmadaSegundos: number
}

const TTL_POR_DEFECTO = 300
// Límite de las URL firmadas con SigV4.
const TTL_MAXIMO = 604_800

function requerida(entorno: NodeJS.ProcessEnv, nombre: string): string {
  const valor = entorno[nombre]
  if (!valor) throw new Error(`${nombre} no está definida`)
  return valor
}

function leerTtl(valor: string | undefined): number {
  if (valor === undefined || valor === "") return TTL_POR_DEFECTO
  const ttl = Number(valor)
  if (!Number.isInteger(ttl) || ttl < 1 || ttl > TTL_MAXIMO) {
    throw new Error(`URL_FIRMADA_TTL_SEGUNDOS inválido: "${valor}"`)
  }
  return ttl
}

/** Variables de MinIO (design.md § Configuración, DEC-3). */
export function leerConfiguracionAlmacenamiento(
  entorno: NodeJS.ProcessEnv = process.env,
): ConfiguracionAlmacenamiento {
  const endpoint = requerida(entorno, "MINIO_ENDPOINT")
  if (!URL.canParse(endpoint)) {
    throw new Error(`MINIO_ENDPOINT no es una URL: "${endpoint}"`)
  }
  return {
    endpoint,
    bucket: requerida(entorno, "MINIO_BUCKET_DOCUMENTOS"),
    accessKey: requerida(entorno, "MINIO_ACCESS_KEY"),
    secretKey: requerida(entorno, "MINIO_SECRET_KEY"),
    ttlUrlFirmadaSegundos: leerTtl(entorno.URL_FIRMADA_TTL_SEGUNDOS),
  }
}
