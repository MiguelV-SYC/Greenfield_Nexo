import {
  type ArchivosDocumentos,
  DOCUMENTOS,
  problemaDelArchivo,
  tamanoLegible,
  type TipoDocumentoLegal,
} from "@/components/organizaciones/documentos/documentos"
import { FilaDocumento } from "@/components/organizaciones/documentos/FilaDocumento"

function IconoCarga() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

export interface PasoDocumentosProps {
  archivos: ArchivosDocumentos
  errores: Partial<Record<TipoDocumentoLegal, string>>
  onCambiar: (
    tipo: TipoDocumentoLegal,
    archivo: File,
    error: string | null,
  ) => void
}

/** Paso 3 del asistente (`#orgwiz-paso-3`): documentos legales (R7.1–R7.3, R7.9). */
export function PasoDocumentos({
  archivos,
  errores,
  onCambiar,
}: PasoDocumentosProps) {
  return (
    <div>
      <div className="ficha-section-title" style={{ marginTop: 0 }}>
        Documentos legales requeridos
      </div>
      <div className="panel-sub" style={{ margin: "0 0 4px" }}>
        Checklist real de soportes exigidos para la identificación de la
        organización y su afiliación a la ARL. PDF o imagen, hasta 10 MB.
      </div>
      <ul aria-label="Documentos legales">
        {DOCUMENTOS.map((d) => {
          const archivo = archivos[d.tipo]
          return (
            <FilaDocumento
              key={d.tipo}
              nombre={d.nombre}
              obligatorio={d.obligatorio}
              meta={
                archivo
                  ? `${tamanoLegible(archivo.size)} · ${archivo.name}`
                  : `${d.nota}${d.obligatorio ? "" : " (opcional)"}`
              }
              estado={
                archivo ? "cargado" : d.obligatorio ? "pendiente" : "opcional"
              }
              error={errores[d.tipo]}
            >
              <label className="doc-file-label">
                <IconoCarga />
                {archivo ? "Reemplazar" : "Cargar"}
                <input
                  type="file"
                  accept=".pdf,image/*"
                  aria-label={`${archivo ? "Reemplazar" : "Cargar"} ${d.nombre}`}
                  onChange={(evento) => {
                    const elegido = evento.target.files?.[0]
                    evento.target.value = ""
                    if (elegido) {
                      onCambiar(d.tipo, elegido, problemaDelArchivo(elegido))
                    }
                  }}
                />
              </label>
            </FilaDocumento>
          )
        })}
      </ul>
      <div
        className="empty-state"
        style={{ padding: "14px 16px", marginTop: 12 }}
      >
        <b>Conservación documental</b> Estos documentos se conservan por un
        mínimo de 20 años conforme al SG-SST (Decreto 1072 de 2015) y no se
        pueden eliminar; al reemplazar uno, la versión anterior se conserva.
      </div>
    </div>
  )
}
