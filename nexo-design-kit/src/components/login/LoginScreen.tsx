"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { LoginCard, type LoginCardProps } from "@/components/login/LoginCard"

export interface LoginScreenProps {
  /** Etiqueta corta sobre el lema, ej. "SG-SST", "QUALITY" o "SOSTENIBILIDAD". */
  label: string
  /** Lema debajo del logo. */
  tagline: ReactNode
  loginCard?: LoginCardProps
}

// Pantalla de login: por defecto solo se ve el hero (logo + lema) sobre el
// background animado (que cada page.tsx coloca detrás vía NexoBackground).
// El botón superior derecho abre/cierra la tarjeta de login, que entra
// deslizándose desde el borde derecho.
export function LoginScreen({ label, tagline, loginCard }: LoginScreenProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-1.5 text-sm font-semibold text-white hover:opacity-80 md:top-8 md:left-10"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Volver
      </Link>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Ocultar inicio de sesión" : "Inicie sesión"}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 text-sm font-semibold text-white hover:opacity-80 md:top-8 md:right-10"
      >
        {open ? (
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        ) : (
          <>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Inicie sesión
          </>
        )}
      </button>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="relative h-68 w-68 sm:h-80 sm:w-80">
          <Image
            src="/logo-nexo-mark-white.png"
            alt="Nexo"
            fill
            sizes="320px"
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.35em] text-white uppercase">
            {label}
          </p>
          <p className="text-lg leading-relaxed text-white">{tagline}</p>
        </div>
      </div>

      <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Nexo. Todos los derechos reservados.
      </p>

      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex items-center pr-6 transition-transform duration-500 ease-out md:pr-16",
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        )}
      >
        <LoginCard {...loginCard} />
      </div>
    </>
  )
}
