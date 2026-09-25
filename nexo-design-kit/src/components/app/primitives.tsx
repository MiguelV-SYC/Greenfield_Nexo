import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// Primitivas visuales del design system V5. Solo emiten las clases de
// src/styles/nexo-v5.css — ver brand/mockup/NexoV.5_mockup.html para ejemplos.

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "orange"

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn("badge", `b-${tone}`)}>
      <span className="dot" />
      {children}
    </span>
  )
}

/** Numeral normativo (ej. "1.1.6") en formato de chip mono. */
export function Numeral({ children }: { children: ReactNode }) {
  return <span className="numeral">{children}</span>
}

export interface PanelProps {
  title: string
  subtitle?: string
  /** Enlace "Ver todo >" a la derecha del título. */
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, subtitle, action, children, className }: PanelProps) {
  return (
    <section className={cn("panel", className)}>
      <div className="panel-head">
        <div className="panel-title">{title}</div>
        {action ? <span className="panel-link">{action}</span> : null}
      </div>
      {subtitle ? <div className="panel-sub">{subtitle}</div> : null}
      {children}
    </section>
  )
}

export function KpiCard({ value, label, aside }: { value: ReactNode; label: string; aside?: ReactNode }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div>
          <div className="kpi-value">{value}</div>
          <div className="kpi-label">{label}</div>
        </div>
        {aside}
      </div>
    </div>
  )
}

export function SummaryCard({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="summary-card">
      <div className="summary-value">{value}</div>
      <div className="summary-label">{label}</div>
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <b>{title}</b>
      {children}
    </div>
  )
}
