import type { Metadata } from "next"

import { PaginaOrganizaciones } from "./pagina-organizaciones"

export const metadata: Metadata = {
  title: "Mis organizaciones | Nexo",
}

export default function OrganizacionesPage() {
  return <PaginaOrganizaciones />
}
