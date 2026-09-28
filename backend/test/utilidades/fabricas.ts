import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import type { App } from "supertest/types"

import { AppModule } from "@/app.module"
import { configurarAplicacion } from "@/app.setup"

/** App completa con identidad simulada (D1), como la levanta main.ts. */
export async function crearAplicacion(): Promise<INestApplication<App>> {
  process.env.AUTH_MODO = "mock"
  const modulo = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  const app = modulo.createNestApplication<INestApplication<App>>({
    bufferLogs: true,
  })
  configurarAplicacion(app)
  await app.init()
  return app
}

/** Cuerpo válido de registro sobre el catálogo mínimo de `sembrarCatalogoMinimo`. */
export function registroValido(sobrescribir: Record<string, unknown> = {}) {
  return {
    razonSocial: "Dirección de Impuestos y Aduanas Nacionales",
    nombreComercial: "DIAN",
    tipoPersona: "JURIDICA",
    nit: "800197268",
    digitoVerificacion: "4",
    repLegalNombre: "Representante de prueba",
    repLegalTipoDoc: "CC",
    repLegalNumeroDoc: "1234567",
    arlCodigo: "aurora",
    sedes: [sedeValida()],
    ...sobrescribir,
  }
}

export function sedeValida(sobrescribir: Record<string, unknown> = {}) {
  return {
    nombre: "Oficina principal",
    direccion: "Calle 36 # 27-52",
    departamentoCodigo: "68",
    municipioCodigo: "68001",
    claseRiesgo: "II",
    trabajadores: 12,
    ciiuCodigo: "6201",
    ...sobrescribir,
  }
}

/**
 * PDF ficticio (D6, Ley 1581: nunca documentos reales del piloto). Con
 * `tamano`, se rellena hasta ese número exacto de bytes.
 */
export function pdfFicticio(texto: string, tamano?: number): Buffer {
  const base = Buffer.from(`%PDF-1.7
% documento ficticio: ${texto}
`)
  if (tamano === undefined) return Buffer.concat([base, Buffer.from("%%EOF")])
  return Buffer.concat([base, Buffer.alloc(tamano - base.length, 0x20)])
}

export const DOCUMENTOS_OBLIGATORIOS = [
  "RUT",
  "CAMARA_COMERCIO",
  "CEDULA_REP_LEGAL",
  "FORMULARIO_ARL",
]

/**
 * POST /organizaciones en multipart (DEC-4): `datos` en JSON y un PDF
 * ficticio por cada tipo de `documentos` (por defecto, los obligatorios).
 */
export function solicitudRegistro(
  app: INestApplication<App>,
  cabeceras: Record<string, string>,
  cuerpo: unknown = registroValido(),
  documentos: string[] = DOCUMENTOS_OBLIGATORIOS,
) {
  let solicitud = request(app.getHttpServer())
    .post("/api/v1/organizaciones")
    .set(cabeceras)
    .field("datos", JSON.stringify(cuerpo))
  for (const tipo of documentos) {
    solicitud = solicitud.attach(tipo, pdfFicticio(tipo), `${tipo}.pdf`)
  }
  return solicitud
}

/** Registra una organización válida y devuelve su id. */
export async function registrarOrganizacion(
  app: INestApplication<App>,
  cabeceras: Record<string, string>,
  cuerpo: Record<string, unknown> = registroValido(),
): Promise<string> {
  const r = await solicitudRegistro(app, cabeceras, cuerpo)
  if (r.status !== 201) throw new Error(`Registro falló: ${r.status}`)
  return r.body.id as string
}
