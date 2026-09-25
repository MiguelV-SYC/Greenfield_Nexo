"use client"

import { useEffect, useState } from "react"

import { Badge, EmptyState } from "@/components/app/primitives"
import { ErrorApi } from "@/lib/api/cliente"
import { DetalleValidacion } from "./DetalleValidacion"
import { DialogoDevolucion } from "./DialogoDevolucion"
import {
  type Caso,
  type ServiciosValidacion,
  serviciosValidacionApi,
} from "./servicios"

type Carga =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; casos: Caso[] }

const fecha = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Bogota",
})

function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorApi && error.estado === 403) {
    return "Solo el Administrador de la plataforma puede validar organizaciones."
  }
  return "No pudimos cargar la cola de validación."
}

function mensajeDeDecision(error: unknown): string {
  return error instanceof ErrorApi && error.estado === 409
    ? "La organización ya no está en validación; la cola se actualizó."
    : "No pudimos registrar la decisión. Intenta de nuevo."
}

function useCola(servicios: ServiciosValidacion) {
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })
  const [version, setVersion] = useState(0)
  useEffect(() => {
    let vigente = true
    servicios
      .cola()
      .then((casos) => vigente && setCarga({ estado: "listo", casos }))
      .catch(
        (e: unknown) =>
          vigente && setCarga({ estado: "error", mensaje: mensajeDeError(e) }),
      )
    return () => {
      vigente = false
    }
  }, [servicios, version])
  const recargar = () => {
    setCarga({ estado: "cargando" })
    setVersion((v) => v + 1)
  }
  return { carga, recargar }
}

function TablaCola({
  casos,
  onRevisar,
}: {
  casos: Caso[]
  onRevisar: (id: string) => void
}) {
  return (
    <div className="table-panel panel">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr>
            <th>Organización</th>
            <th>NIT</th>
            <th>Enviada</th>
            <th>Riesgo</th>
            <th>Trabajadores</th>
            <th>Estándares</th>
            <th>Sedes</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {casos.map((c) => (
            <tr key={c.id}>
              <td>
                <b>{c.nombreVisible}</b>
                <span className="block text-[11.5px] text-[var(--text-secondary)]">
                  {c.razonSocial}
                </span>
              </td>
              <td className="font-mono">
                {c.nit}-{c.digitoVerificacion}
              </td>
              <td className="font-mono">
                {fecha.format(new Date(c.enviadaEn))}
              </td>
              <td>
                <Badge
                  tone={
                    c.riesgoMaximo === "IV" || c.riesgoMaximo === "V"
                      ? "danger"
                      : "neutral"
                  }
                >
                  {c.riesgoMaximo}
                </Badge>
              </td>
              <td>{c.totalTrabajadores}</td>
              <td>{c.estandaresAplicables}</td>
              <td>{c.sedes}</td>
              <td>
                <button
                  type="button"
                  className="btn"
                  onClick={() => onRevisar(c.id)}
                >
                  Revisar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Cola de validación del Administrador (R5.8–R5.11, R4.3–R4.5), con primitivas V5 (DEC-9). */
export function ColaValidacion({
  servicios = serviciosValidacionApi,
}: {
  servicios?: ServiciosValidacion
}) {
  const { carga, recargar } = useCola(servicios)
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const [devolviendo, setDevolviendo] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{
    tipo: "ok" | "error"
    texto: string
  } | null>(null)

  async function decidir(accion: () => Promise<void>, exito: string) {
    try {
      await accion()
      setAviso({ tipo: "ok", texto: exito })
    } catch (error) {
      setAviso({ tipo: "error", texto: mensajeDeDecision(error) })
    }
    setSeleccion(null)
    setDevolviendo(null)
    recargar()
  }

  if (carga.estado === "cargando")
    return <p role="status">Cargando cola de validación…</p>
  if (carga.estado === "error") {
    return (
      <div role="alert" className="empty-state">
        <p>{carga.mensaje}</p>
        <button type="button" className="btn" onClick={recargar}>
          Reintentar
        </button>
      </div>
    )
  }
  return (
    <div>
      {aviso && (
        <p
          role={aviso.tipo === "ok" ? "status" : "alert"}
          className="mb-3 text-sm"
        >
          {aviso.texto}
        </p>
      )}
      {carga.casos.length === 0 ? (
        <EmptyState title="Sin pendientes">
          No hay organizaciones en validación.
        </EmptyState>
      ) : (
        <TablaCola casos={carga.casos} onRevisar={setSeleccion} />
      )}
      {seleccion && (
        <DetalleValidacion
          id={seleccion}
          detalle={servicios.detalle}
          onAprobar={() =>
            decidir(
              () => servicios.aprobar(seleccion),
              "Organización aprobada.",
            )
          }
          onDevolver={(nombre) => setDevolviendo(nombre)}
        />
      )}
      <DialogoDevolucion
        abierto={devolviendo !== null}
        organizacion={devolviendo ?? ""}
        onCerrar={() => setDevolviendo(null)}
        onConfirmar={(motivo) =>
          seleccion &&
          decidir(
            () => servicios.devolver(seleccion, motivo),
            "Organización devuelta al Líder SST.",
          )
        }
      />
    </div>
  )
}
