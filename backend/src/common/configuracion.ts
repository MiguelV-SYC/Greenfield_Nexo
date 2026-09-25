export interface Configuracion {
  puerto: number
  entorno: string
  nivelLog: string
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

export function leerConfiguracion(
  entorno: NodeJS.ProcessEnv = process.env,
): Configuracion {
  return {
    puerto: leerPuerto(entorno.PORT),
    entorno: entorno.NODE_ENV ?? "development",
    nivelLog: entorno.LOG_LEVEL ?? "info",
  }
}
