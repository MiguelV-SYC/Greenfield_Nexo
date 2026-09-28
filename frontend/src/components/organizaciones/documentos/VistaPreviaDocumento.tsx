import { Modal } from "@/components/app/Modal"

export interface DocumentoEnVista {
  nombre: string
  nombreArchivo: string
  tipoMime: string
  url: string
}

/** `#modal-doc-preview` del mockup V5 con la URL firmada (R7.6, R7.7). */
export function VistaPreviaDocumento({
  documento,
  onCerrar,
}: {
  documento: DocumentoEnVista | null
  onCerrar: () => void
}) {
  return (
    <div className="nexo-app contents">
      <Modal
        open={documento !== null}
        onClose={onCerrar}
        title={documento?.nombre ?? "Documento"}
        subtitle={documento?.nombreArchivo}
      >
        {documento &&
          (documento.tipoMime.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL firmada externa, sin optimizar
            <img
              src={documento.url}
              alt={`${documento.nombre}: ${documento.nombreArchivo}`}
              className="mx-auto block max-w-full rounded-[10px]"
            />
          ) : (
            <iframe
              src={documento.url}
              title={`${documento.nombre}: ${documento.nombreArchivo}`}
              className="doc-preview-frame"
            />
          ))}
        {documento && (
          <p className="mt-3 text-[12px]">
            <a
              href={documento.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Abrir en otra pestaña
            </a>{" "}
            (el enlace vence en 5 minutos)
          </p>
        )}
      </Modal>
    </div>
  )
}
