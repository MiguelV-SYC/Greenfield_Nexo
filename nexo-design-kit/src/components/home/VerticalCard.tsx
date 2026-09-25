import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

export interface VerticalCardProps {
  title: string
  href: string
}

// Tarjeta de acceso a un nodo de Nexo (SST, Quality, Sostenibilidad) desde
// el home previo al login. Toda la tarjeta es el enlace: "Ingresar" es la
// affordance visual, no el único punto clicable. Tratamiento neutro (blanco)
// a propósito: no adopta el color de acento de cada nodo.
export function VerticalCard({ title, href }: VerticalCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex w-full flex-col items-center gap-5 overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-8 py-14 text-center backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10"
    >
      <span
        aria-hidden="true"
        className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 opacity-25 blur-3xl transition-opacity duration-200 group-hover:opacity-40"
      />

      <h2 className="relative font-heading text-2xl font-bold text-white sm:text-3xl">
        {title}
      </h2>

      <span className="relative flex items-center gap-1.5 text-sm font-bold text-white transition-transform duration-200 group-hover:translate-x-1">
        Ingresar
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
      </span>
    </Link>
  )
}
