import { leerConfiguracionAlmacenamiento } from "./configuracion-almacenamiento"

const completo = {
  MINIO_ENDPOINT: "http://localhost:9000",
  MINIO_BUCKET_DOCUMENTOS: "nexo-documentos",
  MINIO_ACCESS_KEY: "nexo-app",
  MINIO_SECRET_KEY: "secreto",
}

describe("leerConfiguracionAlmacenamiento", () => {
  // Derived from R7.7: URL firmada de 5 minutos por defecto
  it("lee las variables y usa 300 s de vigencia por defecto", () => {
    expect(leerConfiguracionAlmacenamiento(completo)).toEqual({
      endpoint: "http://localhost:9000",
      bucket: "nexo-documentos",
      accessKey: "nexo-app",
      secretKey: "secreto",
      ttlUrlFirmadaSegundos: 300,
    })
  })

  it("acepta otra vigencia", () => {
    const configuracion = leerConfiguracionAlmacenamiento({
      ...completo,
      URL_FIRMADA_TTL_SEGUNDOS: "60",
    })
    expect(configuracion.ttlUrlFirmadaSegundos).toBe(60)
  })

  it.each(["0", "-5", "1.5", "abc", "604801"])(
    "rechaza la vigencia %s",
    (ttl) => {
      expect(() =>
        leerConfiguracionAlmacenamiento({
          ...completo,
          URL_FIRMADA_TTL_SEGUNDOS: ttl,
        }),
      ).toThrow(/URL_FIRMADA_TTL_SEGUNDOS/)
    },
  )

  it.each(Object.keys(completo))("falla si falta %s", (nombre) => {
    const entorno: NodeJS.ProcessEnv = { ...completo, [nombre]: undefined }
    expect(() => leerConfiguracionAlmacenamiento(entorno)).toThrow(nombre)
  })

  it("rechaza un endpoint que no es URL", () => {
    expect(() =>
      leerConfiguracionAlmacenamiento({ ...completo, MINIO_ENDPOINT: "minio" }),
    ).toThrow(/MINIO_ENDPOINT/)
  })
})
