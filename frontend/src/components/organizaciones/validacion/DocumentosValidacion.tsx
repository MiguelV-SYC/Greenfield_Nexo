import { useEffect, useState } from "react"

import { tamanoLegible } from "@/components/organizaciones/documentos/documentos"
import { FilaDocumento } from "@/components/organizaciones/documentos/FilaDocumento"
import {
  type DocumentoEnVista,
  VistaPreviaDocumento,
} from "@/components/organizaciones/documentos/VistaPreviaDocumento"
import type { DocumentoLegal, ServiciosValidacion } from "./servicios"

type Carga =
  | { estado: "cargando" }
  | { estado: "error" }
  | { estado: "listo"; documentos: DocumentoLegal[] }

const fecha = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Bogota",
})

function useDocumentos(id: string, servicios: ServiciosValidacion) {
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    let vigente = true
    servicios
      .documentos(id)
      .then(
        (lista) =>
          vigente &&
          setCarga({ estado: "listo", documentos: lista.documentos }),
      )
      .catch(() => vigente && setCarga({ estado: "error" }))
    return () => {
      vigente = false
    }
  }, [id, servicios, intento])
  const reintentar = () => {
    setCarga({ estado: "cargando" })
    setIntento((n) => n + 1)
  }
  return { carga, reintentar }
}

/** R7.6: el Administrador consulta los documentos antes de aprobar. */
export function DocumentosValidacion({
  id,
  servicios,
}: {
  id: string
  servicios: ServiciosValidacion
}) {
  const { carga, reintentar } = useDocumentos(id, servicios)
  const [enVista, setEnVista] = useState<DocumentoEnVista | null>(null)
  const [errorVista, setErrorVista] = useState<string | null>(null)

  async function ver(documento: DocumentoLegal) {
    if (!documento.vigente) return
    setErrorVista(null)
    try {
      const { url } = await servicios.urlDocumento(id, documento.tipo)
      setEnVista({
        nombre: documento.nombre,
        nombreArchivo: documento.vigente.nombreArchivo,
        tipoMime: documento.vigente.tipoMime,
        url,
      })
    } catch {
      setErrorVista("No pudimos abrir el documento. Intenta de nuevo.")
    }
  }

  return (
    <div>
      <div className="ficha-section-title">Documentos legales</div>
      {carga.estado === "cargando" && <p role="status">Cargando documentos…</p>}
      {carga.estado === "error" && (
        <div role="alert" className="empty-state">
          <p>No pudimos cargar los documentos.</p>
          <button type="button" className="btn" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      )}
      {carga.estado === "listo" && (
        <ul aria-label="Documentos legales">
          {carga.documentos.map((d) => (
            <FilaDocumento
              key={d.tipo}
              nombre={d.nombre}
              obligatorio={d.obligatorio}
              meta={
                d.vigente
                  ? `${tamanoLegible(d.vigente.tamanoBytes)} · ${d.vigente.nombreArchivo} · versión ${d.vigente.version} · ${fecha.format(new Date(d.vigente.cargadoEn))}`
                  : d.obligatorio
                    ? "Sin cargar"
                    : "Sin cargar (opcional)"
              }
              estado={
                d.vigente ? "cargado" : d.obligatorio ? "falta" : "opcional"
              }
            >
              {d.vigente && (
                <button
                  type="button"
                  className="doc-preview-btn"
                  aria-label={`Ver ${d.nombre}`}
                  onClick={() => ver(d)}
                >
                  Ver
                </button>
              )}
            </FilaDocumento>
          ))}
        </ul>
      )}
      {errorVista && (
        <p role="alert" className="mt-2 text-sm text-[#C62828]">
          {errorVista}
        </p>
      )}
      <VistaPreviaDocumento
        documento={enVista}
        onCerrar={() => setEnVista(null)}
      />
    </div>
  )
}
