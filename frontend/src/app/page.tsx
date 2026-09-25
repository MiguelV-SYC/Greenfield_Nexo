import type { Metadata } from "next"

import { Logo3D } from "@/components/brand/Logo3D"
import { NexoBackground } from "@/components/background/NexoBackground"
import { VerticalCard } from "@/components/home/VerticalCard"

export const metadata: Metadata = {
  title: "Nexo",
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08344A]">
      <NexoBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-10">
        <Logo3D variant="light" className="h-80 w-80 sm:h-88 sm:w-88" />

        <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          <VerticalCard title="SG-SST" href="/login" />
          <VerticalCard title="Quality" href="/loginquality" />
          <VerticalCard title="Sostenibilidad" href="/loginsostenibilidad" />
        </div>

        <p className="mt-auto pt-16 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Nexo. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
