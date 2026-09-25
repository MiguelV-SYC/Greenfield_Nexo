"use client"

import { useEffect, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

// Modal genérico del mockup V5 (fichas técnicas, wizards, editor de acta).
// Cierra con Escape o clic en el fondo.
export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  return (
    <div
      className={cn("modal-overlay", open && "open")}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal-box" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle ? <div className="modal-sub">{subtitle}</div> : null}
          </div>
          <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
