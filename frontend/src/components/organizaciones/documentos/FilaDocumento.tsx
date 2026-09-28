import type { ReactNode } from "react"

import { Badge } from "@/components/app/primitives"
import { cn } from "@/lib/utils"

export type EstadoFila = "cargado" | "pendiente" | "opcional" | "falta"

const INSIGNIAS: Record<
  EstadoFila,
  { tono: "success" | "warning" | "neutral" | "danger"; texto: string }
> = {
  cargado: { tono: "success", texto: "Cargado" },
  pendiente: { tono: "warning", texto: "Pendiente" },
  opcional: { tono: "neutral", texto: "Opcional" },
  falta: { tono: "danger", texto: "Falta" },
}

function IconoArchivo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
    </svg>
  )
}

export interface FilaDocumentoProps {
  nombre: string
  obligatorio: boolean
  meta: string
  estado: EstadoFila
  error?: string | null
  children?: ReactNode
}

/** Fila `doc-upload-item` del mockup V5 (asistente y revisión). */
export function FilaDocumento({
  nombre,
  obligatorio,
  meta,
  estado,
  error,
  children,
}: FilaDocumentoProps) {
  const insignia = INSIGNIAS[estado]
  return (
    <li
      className={cn("doc-upload-item", estado === "cargado" && "is-uploaded")}
    >
      <div className="doc-upload-icon">
        <IconoArchivo />
      </div>
      <div className="doc-upload-main">
        <div className="doc-upload-name">
          {nombre}
          {obligatorio && (
            <>
              <span aria-hidden> *</span>
              <span className="sr-only"> (obligatorio)</span>
            </>
          )}
        </div>
        <div className="doc-upload-meta">{meta}</div>
        {error && (
          <p role="alert" className="mt-1 text-[11.5px] text-[#C62828]">
            {error}
          </p>
        )}
      </div>
      <div className="doc-upload-actions">
        <Badge tone={insignia.tono}>{insignia.texto}</Badge>
        {children}
      </div>
    </li>
  )
}
