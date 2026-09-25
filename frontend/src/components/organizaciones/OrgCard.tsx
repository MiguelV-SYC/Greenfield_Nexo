import type { ReactNode } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Shield01Icon,
  HealthIcon,
  UserMultipleIcon,
  TrendingUpIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

export type RiskClass = "I" | "II" | "III" | "IV"

const riskStyles: Record<RiskClass, string> = {
  I: "bg-[#E9F5EA] text-[#1E5C22]",
  II: "bg-[#FFF6E0] text-[#8A5A00]",
  III: "bg-[#FDEDE0] text-[#B4560A]",
  IV: "bg-[#FDECEC] text-[#B71C1C]",
}

export interface Organization {
  name: string
  logoSrc: string
  riskClass: RiskClass
  arl: string
  workers: number
  implementationPct: number
  compliancePct: number
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: typeof Shield01Icon
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-[7px] text-[13px]">
      <span className="flex min-w-0 flex-1 items-center gap-2 text-[#6B7280]">
        <HugeiconsIcon icon={icon} size={15} className="shrink-0 text-[#9CA5B0]" />
        <span className="min-w-0">{label}</span>
      </span>
      <span className="shrink-0">{children}</span>
    </div>
  )
}

export function OrgCard({ org }: { org: Organization }) {
  return (
    <div className="group rounded-2xl border border-[#E5E9EE] bg-white px-[22px] pt-[26px] pb-5 transition-[box-shadow,border-color] duration-150 hover:border-[#D6DCE2] hover:shadow-[0_10px_26px_rgba(11,79,108,0.10)]">
      <div className="mb-3.5 flex h-14 items-center justify-center">
        <div className="relative h-full w-full">
          <Image
            src={org.logoSrc}
            alt={org.name}
            fill
            sizes="220px"
            className="object-contain"
          />
        </div>
      </div>
      <div className="mb-4 text-center font-heading text-base font-bold text-[#08344A]">
        {org.name}
      </div>

      <Detail icon={Shield01Icon} label="Riesgo clase">
        <span
          className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${riskStyles[org.riskClass]}`}
        >
          {org.riskClass}
        </span>
      </Detail>
      <Detail icon={HealthIcon} label="ARL">
        <span className="font-semibold text-[#08344A]">{org.arl}</span>
      </Detail>
      <Detail icon={UserMultipleIcon} label="Trabajadores activos">
        <span className="font-semibold text-[#08344A]">{org.workers}</span>
      </Detail>
      <Detail icon={TrendingUpIcon} label="% Implementación del sistema">
        <span className="font-semibold text-[#08344A]">
          {org.implementationPct}%
        </span>
      </Detail>
      <Detail icon={CheckmarkCircle01Icon} label="% Cumplimiento">
        <span className="font-semibold text-[#08344A]">
          {org.compliancePct}%
        </span>
      </Detail>

      <hr className="mt-3 mb-3.5 border-[#E5E9EE]" />

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-bold text-[#0B4F6C]">
          Ingresar
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </div>
  )
}
