import type { ReactNode } from "react"

import { Sidebar } from "@/components/app/Sidebar"
import { AiAssistant } from "@/components/app/AiAssistant"
import type { SystemId } from "@/lib/navigation"

export interface AppShellProps {
  system: SystemId
  /** Nombre corto de la organización activa, se muestra junto al logo ("Nexo · SYC"). */
  orgName: string
  children: ReactNode
}

// Contenedor de toda la app autenticada (diseño V5 aprobado): sidebar tipo
// "lomo de expediente" + área principal + asistente IA flotante. La clase
// `nexo-app` activa los tokens y estilos de src/styles/nexo-v5.css.
export function AppShell({ system, orgName, children }: AppShellProps) {
  return (
    <div className="nexo-app">
      <Sidebar system={system} orgName={orgName} />
      <main className="main">{children}</main>
      <AiAssistant />
    </div>
  )
}
