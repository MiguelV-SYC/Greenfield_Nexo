import { type FormEvent, useState } from "react"

import { Modal } from "@/components/app/Modal"

export interface DialogoDevolucionProps {
  abierto: boolean
  organizacion: string
  onCerrar: () => void
  onConfirmar: (motivo: string) => void
}

/** R4.4: devolver exige un motivo no vacío; se envía recortado (R4.5). */
export function DialogoDevolucion({
  abierto,
  organizacion,
  onCerrar,
  onConfirmar,
}: DialogoDevolucionProps) {
  const [motivo, setMotivo] = useState("")
  const [error, setError] = useState<string | null>(null)

  function confirmar(evento: FormEvent) {
    evento.preventDefault()
    const texto = motivo.trim()
    if (texto === "") {
      setError("Escribe el motivo de la devolución")
      return
    }
    onConfirmar(texto)
    setMotivo("")
    setError(null)
  }

  return (
    <Modal
      open={abierto}
      onClose={onCerrar}
      title="Devolver organización"
      subtitle={organizacion}
    >
      <form onSubmit={confirmar} noValidate>
        <div className="form-row">
          <label className="form-label" htmlFor="motivo-devolucion">
            Motivo de la devolución *
          </label>
          <textarea
            id="motivo-devolucion"
            className="form-input"
            rows={4}
            maxLength={1000}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          {error && <p className="mt-1 text-xs text-[#C62828]">{error}</p>}
        </div>
        <div className="wizard-nav">
          <button type="button" className="btn" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn primary">
            Confirmar devolución
          </button>
        </div>
      </form>
    </Modal>
  )
}
