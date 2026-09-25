import type { Metadata } from "next"

import { Topbar } from "@/components/organizaciones/Topbar"
import { ColaValidacion } from "@/components/organizaciones/validacion/ColaValidacion"

export const metadata: Metadata = {
  title: "Validación de organizaciones | Nexo",
}

/** Cola del Administrador de la plataforma (R5.8, DEC-9: sin vista en el mockup). */
export default function ValidacionPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Topbar />
      <main className="nexo-app mx-auto block min-h-0 max-w-[1280px] bg-transparent px-10 py-8">
        <h1 className="mb-1 font-heading text-[22px] font-bold text-[#08344A]">
          Validación de organizaciones
        </h1>
        <p className="mb-6 text-sm text-[#6B7280]">
          Organizaciones registradas por Líderes SST, de la más antigua a la más
          reciente.
        </p>
        <ColaValidacion />
      </main>
    </div>
  )
}
