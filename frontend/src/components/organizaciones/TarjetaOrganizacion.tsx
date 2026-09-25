import type { ReactNode } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Shield01Icon,
  HealthIcon,
  UserMultipleIcon,
  TrendingUpIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import type { Tarjeta } from "@/lib/api/cliente"

type ClaseRiesgo = Tarjeta["riesgoMaximo"]
type Estado = Tarjeta["estado"]

// Mismos colores de OrgCard del kit; V se agrega con el tono de IV (mockup).
const ESTILO_RIESGO: Record<ClaseRiesgo, string> = {
  I: "bg-[#E9F5EA] text-[#1E5C22]",
  II: "bg-[#FFF6E0] text-[#8A5A00]",
  III: "bg-[#FDEDE0] text-[#B4560A]",
  IV: "bg-[#FDECEC] text-[#B71C1C]",
  V: "bg-[#FDECEC] text-[#B71C1C]",
}

const ESTADO: Record<Estado, { texto: string; estilo: string }> = {
  APROBADA: { texto: "Aprobada", estilo: "bg-[#E9F5EA] text-[#1E5C22]" },
  EN_VALIDACION: {
    texto: "En validación",
    estilo: "bg-[#FFF6E0] text-[#8A5A00]",
  },
  DEVUELTA: { texto: "Devuelta", estilo: "bg-[#FDECEC] text-[#B71C1C]" },
}

function Detalle({
  icono,
  etiqueta,
  children,
}: {
  icono: typeof Shield01Icon
  etiqueta: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-[7px] text-[13px]">
      <span className="flex min-w-0 flex-1 items-center gap-2 text-[#6B7280]">
        <HugeiconsIcon
          icon={icono}
          size={15}
          className="shrink-0 text-[#9CA5B0]"
        />
        <span className="min-w-0">{etiqueta}</span>
      </span>
      <span className="shrink-0 font-semibold text-[#08344A]">{children}</span>
    </div>
  )
}

/** R5.3: sin cumplimiento-normativo (D2) el porcentaje se muestra "Sin evaluar". */
function porcentaje(valor: number | null): string {
  return valor === null ? "Sin evaluar" : `${valor}%`
}

function iniciales(nombre: string): string {
  return nombre.trim().slice(0, 2).toUpperCase()
}

/** Tarjeta de "Mis organizaciones" (R5.2–R5.5), con el diseño de OrgCard del kit. */
export function TarjetaOrganizacion({ tarjeta }: { tarjeta: Tarjeta }) {
  const estado = ESTADO[tarjeta.estado]
  const tituloId = `org-${tarjeta.id}`
  return (
    <article
      aria-labelledby={tituloId}
      className="group rounded-2xl border border-[#E5E9EE] bg-white px-[22px] pt-[26px] pb-5 transition-[box-shadow,border-color] duration-150 hover:border-[#D6DCE2] hover:shadow-[0_10px_26px_rgba(11,79,108,0.10)]"
    >
      <div className="mb-3.5 flex h-14 items-center justify-center">
        <div
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F5F7FA] font-heading text-xl font-bold text-[#0B4F6C]"
        >
          {iniciales(tarjeta.nombreVisible)}
        </div>
      </div>
      <h3
        id={tituloId}
        className="mb-2 text-center font-heading text-base font-bold text-[#08344A]"
      >
        {tarjeta.nombreVisible}
      </h3>
      <p className="mb-3 text-center">
        <span
          className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${estado.estilo}`}
        >
          {estado.texto}
        </span>
      </p>

      <Detalle icono={Shield01Icon} etiqueta="Riesgo clase (mayor)">
        <span
          className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${ESTILO_RIESGO[tarjeta.riesgoMaximo]}`}
        >
          {tarjeta.riesgoMaximo}
        </span>
      </Detalle>
      <Detalle icono={HealthIcon} etiqueta="ARL">
        {tarjeta.arl?.nombre ?? "Sin ARL"}
      </Detalle>
      <Detalle icono={UserMultipleIcon} etiqueta="Trabajadores activos">
        {tarjeta.totalTrabajadores}
      </Detalle>
      <Detalle icono={TrendingUpIcon} etiqueta="% Implementación del sistema">
        {porcentaje(tarjeta.porcentajeImplementacion)}
      </Detalle>
      <Detalle icono={CheckmarkCircle01Icon} etiqueta="% Cumplimiento">
        {porcentaje(tarjeta.porcentajeCumplimiento)}
      </Detalle>

      {tarjeta.motivoDevolucion && (
        <p className="mt-3 rounded-lg bg-[#FDECEC] px-3 py-2 text-xs text-[#8A1C1C]">
          <b className="block">Motivo de la devolución</b>
          {tarjeta.motivoDevolucion}
        </p>
      )}

      <hr className="mt-3 mb-3.5 border-[#E5E9EE]" />

      {tarjeta.puedeIngresar ? (
        <Link
          href="/sgsst"
          className="flex items-center gap-1.5 text-sm font-bold text-[#0B4F6C]"
        >
          Ingresar
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </Link>
      ) : (
        <span className="text-sm font-semibold text-[#6B7280]">
          {estado.texto}
        </span>
      )}
    </article>
  )
}
