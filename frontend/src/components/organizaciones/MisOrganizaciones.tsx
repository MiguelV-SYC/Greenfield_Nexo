"use client"

import { useCallback, useEffect, useState } from "react"

import { api, exigir, type ListaOrganizaciones } from "@/lib/api/cliente"
import { TarjetaOrganizacion } from "./TarjetaOrganizacion"

type Carga =
  | { estado: "cargando" }
  | { estado: "error" }
  | { estado: "listo"; lista: ListaOrganizaciones }

export async function cargarMisOrganizaciones(): Promise<ListaOrganizaciones> {
  return exigir(await api.GET("/api/v1/organizaciones"))
}

export interface MisOrganizacionesProps {
  cargar?: () => Promise<ListaOrganizaciones>
  onAgregar?: () => void
}

/**
 * "Mis organizaciones" con datos reales (R5.1–R5.7, R5.10, R5.11). Para
 * recargar (p. ej. tras registrar), el padre la remonta con otra `key`.
 */
export function MisOrganizaciones({
  cargar = cargarMisOrganizaciones,
  onAgregar,
}: MisOrganizacionesProps) {
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    cargar()
      .then((lista) => vigente && setCarga({ estado: "listo", lista }))
      .catch(() => vigente && setCarga({ estado: "error" }))
    return () => {
      vigente = false
    }
  }, [cargar, intento])

  const reintentar = useCallback(() => {
    setCarga({ estado: "cargando" })
    setIntento((n) => n + 1)
  }, [])

  if (carga.estado === "cargando") {
    return (
      <p role="status" className="py-10 text-center text-sm text-[#6B7280]">
        Cargando organizaciones…
      </p>
    )
  }

  if (carga.estado === "error") {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-[#F3C7C7] bg-white p-6 text-center"
      >
        <p className="text-sm text-[#8A1C1C]">
          No pudimos cargar tus organizaciones.
        </p>
        <button
          type="button"
          onClick={reintentar}
          className="mt-3 rounded-lg bg-[#1D7D7B] px-4 py-2 text-sm font-bold text-white"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const { total, organizaciones } = carga.lista
  return (
    <section aria-labelledby="titulo-mis-organizaciones">
      <h2
        id="titulo-mis-organizaciones"
        className="mb-4 font-heading text-[19px] font-bold text-[#08344A]"
      >
        Mis organizaciones{" "}
        <span className="text-sm font-semibold text-[#6B7280]">
          · {total} {total === 1 ? "organización" : "organizaciones"}
        </span>
      </h2>
      {total === 0 ? (
        <div className="rounded-2xl border border-[#E5E9EE] bg-white p-8 text-center">
          <p className="text-sm text-[#6B7280]">
            Aún no tienes organizaciones. Registra la primera para empezar.
          </p>
          <button
            type="button"
            onClick={onAgregar}
            className="mt-4 rounded-xl bg-[linear-gradient(120deg,#1C7A6B,#2CA6A4)] px-5 py-2.5 text-sm font-bold text-white"
          >
            Agregar organización
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {organizaciones.map((o) => (
            <TarjetaOrganizacion key={o.id} tarjeta={o} />
          ))}
        </div>
      )}
    </section>
  )
}
