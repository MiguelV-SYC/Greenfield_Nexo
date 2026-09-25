"use client"

import { BottomBanner } from "@/components/organizaciones/BottomBanner"
import { Hero } from "@/components/organizaciones/Hero"
import { MisOrganizaciones } from "@/components/organizaciones/MisOrganizaciones"
import { Topbar } from "@/components/organizaciones/Topbar"

/** Pantalla /organizaciones del kit con datos reales (R5.1–R5.7). */
export function PaginaOrganizaciones() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Topbar />
      <Hero
        title={
          <>
            ¡Bienvenido a <span className="text-[#2CA6A4]">Nexo</span>!
          </>
        }
        subtitle="Desde aquí puedes acceder y gestionar los Sistemas de Gestión de Seguridad y Salud en el Trabajo de cada una de tus organizaciones."
        kpis={[]}
      />

      <div className="mx-auto max-w-[1280px] px-10 pb-[50px]">
        <MisOrganizaciones />
      </div>

      <BottomBanner />

      <footer className="p-[26px] text-center text-[11px] text-[#6B7280]">
        © {new Date().getFullYear()} Nexo. Todos los derechos reservados.
      </footer>
    </div>
  )
}
