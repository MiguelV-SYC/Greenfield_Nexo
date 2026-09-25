import { useEffect, useState } from "react"
import { useWatch } from "react-hook-form"

import type { SedeFormulario } from "./formulario"
import type { Estandares, SedeRiesgo, ServiciosAsistente } from "./servicios"

const ESPERA_MS = 300

/** Solo se consulta con sedes que el backend aceptaría (R2.4). */
function sedesValidas(
  sedes: SedeFormulario[] | undefined,
): SedeRiesgo[] | null {
  if (!sedes || sedes.length === 0) return null
  const validas = sedes.every(
    (s) => Number.isInteger(s.trabajadores) && s.trabajadores >= 1,
  )
  return validas
    ? sedes.map((s) => ({
        claseRiesgo: s.claseRiesgo,
        trabajadores: s.trabajadores,
      }))
    : null
}

/**
 * R3.6: estándares aplicables mientras se diligencian las sedes. La regla la
 * calcula el backend (DEC-5): aquí no se duplica la Res. 0312.
 */
export function VistaPreviaEstandares({
  calcular,
}: {
  calcular: ServiciosAsistente["calcularEstandares"]
}) {
  const sedes = useWatch({ name: "sedes" }) as SedeFormulario[] | undefined
  const [resultado, setResultado] = useState<Estandares | null>(null)
  const consulta = JSON.stringify(sedesValidas(sedes))

  useEffect(() => {
    const cuerpo = JSON.parse(consulta) as SedeRiesgo[] | null
    if (!cuerpo) return
    let vigente = true
    const temporizador = setTimeout(() => {
      calcular(cuerpo)
        .then((r) => vigente && setResultado(r))
        .catch(() => vigente && setResultado(null))
    }, ESPERA_MS)
    return () => {
      vigente = false
      clearTimeout(temporizador)
    }
  }, [consulta, calcular])

  if (!resultado) return null
  return (
    <div
      className="empty-state"
      style={{ padding: "14px 16px", marginTop: 4 }}
      aria-live="polite"
    >
      <b>{resultado.estandares} estándares mínimos aplicables</b>
      <span className="block">
        Según la Resolución 0312 de 2019, con riesgo máximo{" "}
        {resultado.riesgoMaximo} y {resultado.totalTrabajadores} trabajadores en
        total: {resultado.regla}.
      </span>
    </div>
  )
}
