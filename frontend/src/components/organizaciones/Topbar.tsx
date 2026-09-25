import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  ArrowDown01Icon,
  Logout03Icon,
} from "@hugeicons/core-free-icons"

export interface TopbarProps {
  /** Gradiente CSS de fondo del topbar. */
  gradient?: string
  /** Color del texto del avatar circular (iniciales). */
  avatarTextColor?: string
  /** Ruta a la que navega "Salir": el home/login del sistema de gestión actual. */
  logoutHref?: string
}

export function Topbar({
  gradient = "linear-gradient(115deg,#0E5C4F,#1C7A6B 45%,#2CA6A4 100%)",
  avatarTextColor = "#08344A",
  logoutHref = "/login",
}: TopbarProps) {
  return (
    <div
      className="relative flex items-center justify-between overflow-hidden bg-[length:180%_180%] px-10 py-3.5 [animation:topbar-shift_10s_ease-in-out_infinite]"
      style={{ backgroundImage: gradient }}
    >
      {/* efecto de iluminación */}
      <div className="pointer-events-none absolute -top-[60%] left-[10%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_70%)] blur-[10px]" />
      <div className="pointer-events-none absolute -bottom-[70%] right-[15%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)] blur-[14px]" />

      <div className="relative z-10 flex items-center gap-2.5">
        <div className="relative h-[34px] w-[34px]">
          <Image
            src="/logo-nexo-icon-white.png"
            alt="Nexo"
            fill
            sizes="34px"
            className="object-contain"
            priority
          />
        </div>
        <span className="font-heading text-xl font-bold text-white">Nexo</span>
      </div>

      <div className="relative z-10 flex items-center gap-5">
        <div className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white/15 text-white">
          <HugeiconsIcon icon={Notification03Icon} size={18} />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D32F2F] px-[3px] text-[10px] font-bold text-white">
            4
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white font-heading text-[13px] font-bold"
            style={{ color: avatarTextColor }}
          >
            MA
          </div>
          <span className="text-[13px] font-semibold text-white">
            Administrador
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            className="text-white/85"
          />
        </div>

        <div className="h-[30px] w-px bg-white/30" />

        <Link
          href={logoutHref}
          className="flex flex-col items-center gap-0.5 text-white/85 hover:text-white"
        >
          <HugeiconsIcon icon={Logout03Icon} size={18} />
          <span className="text-[11px] font-medium">Salir</span>
        </Link>
      </div>
    </div>
  )
}
