import type { ReactNode } from "react"

import type { ModuleAction } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  breadcrumb: string
  title: string
  subtitle?: string
  actions?: ModuleAction[]
  /** Acciones personalizadas; reemplazan a `actions` si se pasan. */
  children?: ReactNode
}

// Cabecera estándar de cada vista del app: migas + título + subtítulo
// normativo + acciones a la derecha (botón primario al final).
export function PageHeader({ breadcrumb, title, subtitle, actions = [], children }: PageHeaderProps) {
  return (
    <>
      <div className="breadcrumb">{breadcrumb}</div>
      <div className="header">
        <div>
          <h1>{title}</h1>
          {subtitle ? <div className="subtitle">{subtitle}</div> : null}
        </div>
        <div className="header-actions">
          {children ??
            actions.map((action) => (
              <button key={action.label} type="button" className={cn("btn", action.primary && "primary")}>
                {action.label}
              </button>
            ))}
        </div>
      </div>
    </>
  )
}
