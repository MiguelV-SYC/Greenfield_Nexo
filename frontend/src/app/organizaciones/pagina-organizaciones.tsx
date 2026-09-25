"use client"

import { useState } from "react"

import { AsistenteRegistro } from "@/components/organizaciones/asistente/AsistenteRegistro"
import { BottomBanner } from "@/components/organizaciones/BottomBanner"
import { Hero } from "@/components/organizaciones/Hero"
import { MisOrganizaciones } from "@/components/organizaciones/MisOrganizaciones"
import { Topbar } from "@/components/organizaciones/Topbar"

/** Pantalla /organizaciones del kit con datos reales (R5.1–R5.7) y el asistente (R1–R4.1). */
export function PaginaOrganizaciones() {
  const [asistenteAbierto, setAsistenteAbierto] = useState(false)
  // Cambiar la key remonta la lista y la vuelve a pedir tras registrar.
  const [version, setVersion] = useState(0)
  const abrirAsistente = () => setAsistenteAbierto(true)

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
        <MisOrganizaciones key={version} onAgregar={abrirAsistente} />
      </div>

      <BottomBanner onAgregar={abrirAsistente} />

      <footer className="p-[26px] text-center text-[11px] text-[#6B7280]">
        © {new Date().getFullYear()} Nexo. Todos los derechos reservados.
      </footer>

      <AsistenteRegistro
        abierto={asistenteAbierto}
        onCerrar={() => setAsistenteAbierto(false)}
        onRegistrada={() => {
          setAsistenteAbierto(false)
          setVersion((v) => v + 1)
        }}
      />
    </div>
  )
}
