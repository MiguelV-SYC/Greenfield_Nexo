import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GridViewIcon,
  File02Icon,
  Clock01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

import { NetworkCanvas } from "@/components/background/NetworkCanvas"
import { DigitalWave } from "@/components/background/DigitalWave"

export interface HeroKpi {
  icon: typeof GridViewIcon
  value: number
  label: string
  danger?: boolean
}

const defaultKpis: HeroKpi[] = [
  { icon: GridViewIcon, value: 4, label: "Organizaciones" },
  { icon: File02Icon, value: 248, label: "Documentos" },
  { icon: Clock01Icon, value: 12, label: "Pendientes" },
  { icon: AlertCircleIcon, value: 4, label: "Alertas activas", danger: true },
]

export interface HeroProps {
  title: ReactNode
  subtitle: string
  kpiTitle?: string
  kpis?: HeroKpi[]
  /** Acento de marca: color del ícono de KPI y demás detalles. */
  accentColor?: string
  networkAccent?: [number, number, number]
  waveCore?: [number, number, number]
  waveEdge?: [number, number, number]
}

export function Hero({
  title,
  subtitle,
  kpiTitle = "Resumen general",
  kpis = defaultKpis,
  accentColor = "#0B4F6C",
  networkAccent = [44, 166, 164],
  waveCore = [44, 166, 164],
  waveEdge = [14, 92, 79],
}: HeroProps) {
  return (
    <div className="relative grid grid-cols-1 items-center gap-6 overflow-hidden px-10 pt-12 pb-10 lg:grid-cols-[1.4fr_1fr]">
      {/* capa inferior: ola de partículas / flow field */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.45]">
        <DigitalWave coreColor={waveCore} edgeColor={waveEdge} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[62%] opacity-[0.55]">
        <NetworkCanvas accent={networkAccent} />
      </div>

      <div className="relative z-10">
        <h1 className="font-heading text-[30px] font-bold text-[#08344A]">
          {title}
        </h1>
        <p className="mt-2.5 max-w-[46ch] text-sm leading-relaxed text-[#6B7280]">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[280px] justify-self-end rounded-2xl border border-[#E5E9EE] bg-white px-5 py-[22px] shadow-[0_8px_24px_rgba(11,79,108,0.06)]">
        <div className="mb-3.5 font-heading text-sm font-bold text-[#08344A]">
          {kpiTitle}
        </div>
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={
              "flex items-center gap-2.5 py-2" +
              (i > 0 ? " border-t border-[#E5E9EE]" : "")
            }
          >
            <div
              className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F5F7FA]"
              style={{ color: kpi.danger ? "#D32F2F" : accentColor }}
            >
              <HugeiconsIcon icon={kpi.icon} size={14} />
            </div>
            <span className="min-w-7 font-heading text-[15px] font-bold text-[#08344A]">
              {kpi.value}
            </span>
            <span className="text-[12.5px] text-[#6B7280]">{kpi.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
