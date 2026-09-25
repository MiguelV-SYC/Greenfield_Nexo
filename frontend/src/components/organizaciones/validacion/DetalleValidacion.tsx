import { useEffect, useState } from "react"

import { Panel } from "@/components/app/primitives"
import type { DetalleOrganizacion, ServiciosValidacion } from "./servicios"

function Dato({
  etiqueta,
  valor,
}: {
  etiqueta: string
  valor: string | number | null
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-[var(--border)] py-1.5 text-[13px]">
      <span className="text-[var(--text-secondary)]">{etiqueta}</span>
      <b>{valor ?? "—"}</b>
    </div>
  )
}

export interface DetalleValidacionProps {
  id: string
  detalle: ServiciosValidacion["detalle"]
  onAprobar: () => void
  onDevolver: (organizacion: string) => void
}

/** R5.9: identificación legal, sedes y estándares de una organización En validación. */
export function DetalleValidacion({
  id,
  detalle,
  onAprobar,
  onDevolver,
}: DetalleValidacionProps) {
  const [datos, setDatos] = useState<DetalleOrganizacion | null>(null)

  useEffect(() => {
    let vigente = true
    detalle(id)
      .then((d) => vigente && setDatos(d))
      .catch(() => vigente && setDatos(null))
    return () => {
      vigente = false
    }
  }, [id, detalle])

  if (!datos) return <p role="status">Cargando organización…</p>
  return (
    <section aria-label={`Revisión de ${datos.nombreVisible}`}>
      <Panel
        title={`Revisión: ${datos.nombreVisible}`}
        subtitle={`${datos.estandaresAplicables} estándares mínimos aplicables · riesgo máximo ${datos.riesgoMaximo} · ${datos.totalTrabajadores} trabajadores`}
      >
        <Dato etiqueta="Razón social" valor={datos.razonSocial} />
        <Dato
          etiqueta="NIT"
          valor={`${datos.nit}-${datos.digitoVerificacion}`}
        />
        <Dato
          etiqueta="Tipo de persona"
          valor={datos.tipoPersona === "JURIDICA" ? "Jurídica" : "Natural"}
        />
        <Dato etiqueta="Representante legal" valor={datos.repLegalNombre} />
        <Dato etiqueta="ARL" valor={datos.arlCodigo} />
        <div className="ficha-section-title">Sedes ({datos.sedes.length})</div>
        <ul className="text-[13px]">
          {datos.sedes.map((s) => (
            <li key={s.id} className="border-b border-[var(--border)] py-1.5">
              <b>{s.nombre}</b> — {s.direccion} · municipio {s.municipioCodigo}{" "}
              · riesgo {s.claseRiesgo} · {s.trabajadores} trabajadores · CIIU{" "}
              {s.ciiuCodigo}
            </li>
          ))}
        </ul>
        <div className="wizard-nav">
          <button
            type="button"
            className="btn"
            onClick={() => onDevolver(datos.nombreVisible)}
          >
            Devolver
          </button>
          <button type="button" className="btn primary" onClick={onAprobar}>
            Aprobar
          </button>
        </div>
      </Panel>
    </section>
  )
}
