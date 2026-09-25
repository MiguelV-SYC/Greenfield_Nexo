import { useFieldArray, useFormContext } from "react-hook-form"

import { type FormularioRegistro, sedeVacia } from "./formulario"
import type { Opcion, ServiciosAsistente } from "./servicios"
import { TarjetaSede } from "./TarjetaSede"
import { VistaPreviaEstandares } from "./VistaPreviaEstandares"

/** Paso 2: sedes y centros de trabajo (R2.*) con la vista previa (R3.6). */
export function PasoSedes({
  departamentos,
  servicios,
}: {
  departamentos: Opcion[]
  servicios: ServiciosAsistente
}) {
  const { control } = useFormContext<FormularioRegistro>()
  const { fields, append, remove } = useFieldArray({ control, name: "sedes" })

  return (
    <div>
      <div className="panel-head" style={{ marginBottom: 8 }}>
        <div>
          <div className="ficha-section-title" style={{ margin: 0 }}>
            Sedes y centros de trabajo
          </div>
          <div className="panel-sub" style={{ margin: "2px 0 0" }}>
            Cada sede tiene su propia clase de riesgo, dirección y actividad
            económica
          </div>
        </div>
        <button
          type="button"
          className="btn primary"
          style={{ padding: "7px 14px", fontSize: 12 }}
          onClick={() => append(sedeVacia())}
        >
          + Añadir Centro de Trabajo
        </button>
      </div>
      {fields.map((campo, i) => (
        <TarjetaSede
          key={campo.id}
          indice={i}
          departamentos={departamentos}
          // R2.8: la única sede no se puede quitar.
          puedeQuitar={fields.length > 1}
          onQuitar={() => remove(i)}
          servicios={servicios}
        />
      ))}
      <VistaPreviaEstandares calcular={servicios.calcularEstandares} />
    </div>
  )
}
