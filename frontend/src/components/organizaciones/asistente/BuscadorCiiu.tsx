import { useEffect, useState } from "react"
import { useController, useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Campo } from "./Campo"
import type { FormularioRegistro } from "./formulario"
import type { ActividadCiiu, ServiciosAsistente } from "./servicios"

const ESPERA_MS = 250

/** Actividad económica buscable por código o palabra (R2.7). */
export function BuscadorCiiu({
  indice,
  buscar,
}: {
  indice: number
  buscar: ServiciosAsistente["buscarCiiu"]
}) {
  const { control } = useFormContext<FormularioRegistro>()
  const { field, fieldState } = useController({
    control,
    name: `sedes.${indice}.ciiuCodigo`,
  })
  const [texto, setTexto] = useState(field.value)
  const [sugerencias, setSugerencias] = useState<ActividadCiiu[]>([])
  const [abierto, setAbierto] = useState(false)
  const id = `ow-sede-${indice}-ciiu`

  useEffect(() => {
    const consulta = texto.trim()
    if (!abierto || consulta === "") return
    const temporizador = setTimeout(() => {
      buscar(consulta)
        .then(setSugerencias)
        .catch(() => setSugerencias([]))
    }, ESPERA_MS)
    return () => clearTimeout(temporizador)
  }, [texto, abierto, buscar])

  function elegir(actividad: ActividadCiiu) {
    field.onChange(actividad.codigo)
    setTexto(`${actividad.codigo} — ${actividad.descripcion}`)
    setAbierto(false)
  }

  return (
    <Campo
      id={id}
      etiqueta="Actividad económica específica * (CIIU)"
      error={fieldState.error?.message}
      className="form-row relative"
    >
      <input
        id={id}
        className="form-input"
        value={texto}
        role="combobox"
        aria-expanded={abierto && sugerencias.length > 0}
        aria-controls={`${id}-lista`}
        placeholder="Escribe una palabra clave o el código CIIU..."
        onChange={(evento) => {
          setTexto(evento.target.value)
          field.onChange("")
          setAbierto(true)
        }}
      />
      <div
        id={`${id}-lista`}
        role="listbox"
        className={cn(
          "ciiu-suggestions",
          abierto && sugerencias.length > 0 && "open",
        )}
      >
        {sugerencias.map((a) => (
          <div
            key={a.codigo}
            role="option"
            aria-selected={false}
            className="ciiu-suggestion-item"
            onClick={() => elegir(a)}
          >
            <b>{a.codigo}</b> — {a.descripcion}
          </div>
        ))}
      </div>
    </Campo>
  )
}
