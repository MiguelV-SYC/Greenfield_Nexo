export type ModoAutenticacion = "mock" | "ninguno"

export interface Configuracion {
  puerto: number
  entorno: string
  nivelLog: string
  modoAutenticacion: ModoAutenticacion
}

const PUERTO_POR_DEFECTO = 3000
const PUERTO_MAXIMO = 65535

function leerPuerto(valor: string | undefined): number {
  if (valor === undefined) return PUERTO_POR_DEFECTO
  const puerto = Number(valor)
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > PUERTO_MAXIMO) {
    throw new Error(`PORT inválido: "${valor}"`)
  }
  return puerto
}

// DEC-11: la identidad simulada (D1) nunca puede arrancar en producción.
function leerModoAutenticacion(
  valor: string | undefined,
  entorno: string,
): ModoAutenticacion {
  if (valor === undefined || valor === "") return "ninguno"
  if (valor !== "mock") throw new Error(`AUTH_MODO desconocido: "${valor}"`)
  if (entorno === "production") {
    throw new Error("AUTH_MODO=mock no se permite con NODE_ENV=production")
  }
  return "mock"
}

export function leerConfiguracion(
  entorno: NodeJS.ProcessEnv = process.env,
): Configuracion {
  const nombreEntorno = entorno.NODE_ENV ?? "development"
  return {
    puerto: leerPuerto(entorno.PORT),
    entorno: nombreEntorno,
    nivelLog: entorno.LOG_LEVEL ?? "info",
    modoAutenticacion: leerModoAutenticacion(entorno.AUTH_MODO, nombreEntorno),
  }
}
