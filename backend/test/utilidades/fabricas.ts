import type { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
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
