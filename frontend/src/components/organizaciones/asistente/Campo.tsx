import type { ReactNode } from "react"

export interface CampoProps {
  id: string
  etiqueta: ReactNode
  error?: string
  children: ReactNode
  className?: string
}

/** Fila de formulario del V5 (`form-row`) con etiqueta y error asociados. */
export function Campo({
  id,
  etiqueta,
  error,
  children,
  className,
}: CampoProps) {
  return (
    <div className={className ?? "form-row"}>
      <label className="form-label" htmlFor={id}>
        {etiqueta}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-[#C62828]">
          {error}
        </p>
      )}
    </div>
  )
}
