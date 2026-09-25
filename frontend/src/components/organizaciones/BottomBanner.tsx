import { HugeiconsIcon } from "@hugeicons/react"
import {
  LayoutGridIcon,
  ShieldCheckIcon,
  BarChartIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

const items = [
  {
    icon: LayoutGridIcon,
    title: "Gestión centralizada",
    text: "Administra múltiples organizaciones desde un solo lugar.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Información segura",
    text: "Tus datos están protegidos con los más altos estándares de seguridad.",
  },
  {
    icon: BarChartIcon,
    title: "Decisiones informadas",
    text: "Monitorea indicadores clave y mejora continuamente.",
  },
]

export function BottomBanner({ onAgregar }: { onAgregar?: () => void }) {
  return (
    <div className="mx-auto mt-2 max-w-[1280px] px-10">
      <div className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[#E5E9EE] bg-white px-[26px] py-[22px] md:grid-cols-[1fr_1fr_1fr_auto]">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#F5F7FA] text-[#0B4F6C]">
              <HugeiconsIcon icon={item.icon} size={17} />
            </div>
            <div>
              <div className="mb-0.5 text-[13.5px] font-bold text-[#08344A]">
                {item.title}
              </div>
              <div className="text-xs leading-snug text-[#6B7280]">
                {item.text}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAgregar}
          className="flex items-center gap-2.5 rounded-xl bg-[linear-gradient(120deg,#1C7A6B,#2CA6A4)] px-[22px] py-[13px] text-sm font-bold whitespace-nowrap text-white shadow-[0_6px_16px_rgba(44,166,164,0.28)]"
        >
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-white/22">
            <HugeiconsIcon icon={PlusSignIcon} size={13} strokeWidth={3} />
          </span>
          Agregar organización
        </button>
      </div>
    </div>
  )
}
