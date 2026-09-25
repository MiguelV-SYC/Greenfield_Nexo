// Dígito de verificación del NIT según la DIAN (R1.6): cada dígito, de
// derecha a izquierda, se multiplica por un peso primo; el DV sale del
// residuo de la suma entre 11.
const PESOS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
const SOLO_DIGITOS = /^\d+$/

export function esNitBienFormado(nit: string): boolean {
  return SOLO_DIGITOS.test(nit) && nit.length <= PESOS.length
}

export function calcularDigitoVerificacion(nit: string): string {
  if (!esNitBienFormado(nit)) {
    throw new Error("NIT inválido: solo dígitos, máximo 15")
  }
  const suma = [...nit]
    .reverse()
    .reduce((total, digito, i) => total + Number(digito) * PESOS[i], 0)
  const residuo = suma % 11
  return String(residuo > 1 ? 11 - residuo : residuo)
}

export function esDigitoVerificacionValido(nit: string, dv: string): boolean {
  return (
    /^\d$/.test(dv) &&
    esNitBienFormado(nit) &&
    calcularDigitoVerificacion(nit) === dv
  )
}
