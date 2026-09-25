import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { BuscadorCiiu } from "./BuscadorCiiu"
import { Campo } from "./Campo"
import { CLASES_RIESGO, type FormularioRegistro } from "./formulario"
import type { Opcion, ServiciosAsistente } from "./servicios"

const NOMBRE_RIESGO: Record<(typeof CLASES_RIESGO)[number], string> = {
  I: "I — Riesgo mínimo",
  II: "II — Riesgo bajo",
  III: "III — Riesgo medio",
  IV: "IV — Riesgo alto",
  V: "V — Riesgo máximo",
}

function useMunicipios(
  departamento: string,
  cargar: ServiciosAsistente["municipios"],
) {
  const [municipios, setMunicipios] = useState<{ de: string; lista: Opcion[] }>(
    { de: "", lista: [] },
  )
  useEffect(() => {
    if (!departamento) return
    let vigente = true
    cargar(departamento)
      .then((lista) => vigente && setMunicipios({ de: departamento, lista }))
      .catch(() => vigente && setMunicipios({ de: departamento, lista: [] }))
    return () => {
      vigente = false
    }
  }, [departamento, cargar])
  return municipios.de === departamento ? municipios.lista : []
}

export interface TarjetaSedeProps {
  indice: number
  departamentos: Opcion[]
  puedeQuitar: boolean
  onQuitar: () => void
  servicios: Pick<ServiciosAsistente, "municipios" | "buscarCiiu">
}

/** Una sede del paso 2 (R2.2–R2.7), con la tarjeta `sede-card` del mockup. */
export function TarjetaSede({
  indice,
  departamentos,
  puedeQuitar,
  onQuitar,
  servicios,
}: TarjetaSedeProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<FormularioRegistro>()
  const ruta = `sedes.${indice}` as const
  const departamento = useWatch({
    name: `${ruta}.departamentoCodigo`,
  }) as string
  const municipios = useMunicipios(departamento, servicios.municipios)
  const e = errors.sedes?.[indice]
  const id = (campo: string) => `ow-sede-${indice}-${campo}`

  return (
    <fieldset
      className="sede-card"
      aria-label={`Centro de Trabajo #${indice + 1}`}
    >
      <div className="panel-head" style={{ marginBottom: 10 }}>
        <legend className="panel-title" style={{ fontSize: 13 }}>
          Centro de Trabajo #{indice + 1}
        </legend>
        {puedeQuitar && (
          <button
            type="button"
            className="panel-link"
            style={{ color: "var(--danger-text)" }}
            onClick={onQuitar}
          >
            ✕ Quitar
          </button>
        )}
      </div>
      <Campo
        id={id("nombre")}
        etiqueta="Nombre del centro *"
        error={e?.nombre?.message}
      >
        <input
          id={id("nombre")}
          className="form-input"
          placeholder="Ej. Oficina Principal / Bodega"
          {...register(`${ruta}.nombre`)}
        />
      </Campo>
      <Campo
        id={id("direccion")}
        etiqueta="Dirección *"
        error={e?.direccion?.message}
      >
        <input
          id={id("direccion")}
          className="form-input"
          placeholder="Dirección de la sede"
          {...register(`${ruta}.direccion`)}
        />
      </Campo>
      <div className="form-row flex gap-3">
        <Campo
          id={id("departamento")}
          etiqueta="Departamento *"
          error={e?.departamentoCodigo?.message}
          className="flex-1"
        >
          <select
            id={id("departamento")}
            className="form-select"
            {...register(`${ruta}.departamentoCodigo`, {
              onChange: () => setValue(`${ruta}.municipioCodigo`, ""),
            })}
          >
            <option value="">Seleccione...</option>
            {departamentos.map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo
          id={id("municipio")}
          etiqueta="Municipio *"
          error={e?.municipioCodigo?.message}
          className="flex-1"
        >
          <select
            id={id("municipio")}
            className="form-select"
            disabled={municipios.length === 0}
            {...register(`${ruta}.municipioCodigo`)}
          >
            <option value="">Seleccione...</option>
            {municipios.map((m) => (
              <option key={m.codigo} value={m.codigo}>
                {m.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <div className="form-row flex gap-3">
        <Campo
          id={id("riesgo")}
          etiqueta="Clase de riesgo * (Decreto 768 de 2022)"
          className="flex-1"
        >
          <select
            id={id("riesgo")}
            className="form-select"
            {...register(`${ruta}.claseRiesgo`)}
          >
            {CLASES_RIESGO.map((c) => (
              <option key={c} value={c}>
                {NOMBRE_RIESGO[c]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo
          id={id("trabajadores")}
          etiqueta="N.° trabajadores en esta sede *"
          error={e?.trabajadores?.message}
          className="flex-1"
        >
          <input
            id={id("trabajadores")}
            className="form-input"
            type="number"
            min={1}
            {...register(`${ruta}.trabajadores`, { valueAsNumber: true })}
          />
        </Campo>
      </div>
      <BuscadorCiiu indice={indice} buscar={servicios.buscarCiiu} />
    </fieldset>
  )
}
