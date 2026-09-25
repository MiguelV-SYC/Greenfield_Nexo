import type { Metadata } from "next"
import Link from "next/link"

import { Topbar } from "@/components/organizaciones/Topbar"
import { Hero } from "@/components/organizaciones/Hero"
import { OrgCard, type Organization } from "@/components/organizaciones/OrgCard"
import { BottomBanner } from "@/components/organizaciones/BottomBanner"

export const metadata: Metadata = {
  title: "Mis organizaciones | Nexo",
}

// TODO: reemplazar por datos reales del backend (incluida la ARL, hoy fija
// en "Aurora" solo para maquetar esta vista).
const organizations: Organization[] = [
  {
    name: "SYC",
    logoSrc: "/org-syc.jpg",
    riskClass: "III",
    arl: "Aurora",
    workers: 128,
    implementationPct: 76,
    compliancePct: 82,
  },
  {
    name: "Libro Total",
    logoSrc: "/org-libro-total.png",
    riskClass: "II",
    arl: "Aurora",
    workers: 96,
    implementationPct: 68,
    compliancePct: 74,
  },
  {
    name: "Fundación Libro Total",
    logoSrc: "/org-fundacion-libro-total.jpg",
    riskClass: "I",
    arl: "Aurora",
    workers: 42,
    implementationPct: 63,
    compliancePct: 67,
  },
  {
    name: "Prodigia S.A.S.",
    logoSrc: "/org-prodigia.png",
    riskClass: "IV",
    arl: "Aurora",
    workers: 210,
    implementationPct: 54,
    compliancePct: 58,
  },
]

export default function OrganizacionesPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Topbar />
      <Hero
        title={
          <>
            ¡Bienvenido a <span className="text-[#2CA6A4]">Nexo</span>, Miguel
            Angel!
          </>
        }
        subtitle="Desde aquí puedes acceder y gestionar los Sistemas de Gestión de Seguridad y Salud en el Trabajo de cada una de tus organizaciones."
      />

      <div className="mx-auto max-w-[1280px] px-10 pb-[50px]">
        <div className="mb-4 font-heading text-[19px] font-bold text-[#08344A]">
          Mis organizaciones
        </div>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
          {organizations.map((org) => (
            <Link key={org.name} href="/sgsst" className="block">
              <OrgCard org={org} />
            </Link>
          ))}
        </div>
      </div>

      <BottomBanner />

      <footer className="p-[26px] text-center text-[11px] text-[#6B7280]">
        © {new Date().getFullYear()} Nexo. Todos los derechos reservados.
      </footer>
    </div>
  )
}
