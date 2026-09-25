import type { Metadata } from "next"

import { ModulePage } from "@/components/app/ModulePage"

export const metadata: Metadata = {
  title: "Panel PESV | Nexo",
}

export default function PesvPanelPage() {
  return <ModulePage system="pesv" slug="" />
}
