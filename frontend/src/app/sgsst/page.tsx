import type { Metadata } from "next"

import { ModulePage } from "@/components/app/ModulePage"
import { PanelGeneral } from "@/components/app/dashboard/PanelGeneral"

export const metadata: Metadata = {
  title: "Panel general | Nexo",
}

export default function SgsstPanelPage() {
  return (
    <ModulePage system="sgsst" slug="">
      <PanelGeneral />
    </ModulePage>
  )
}
