"use client"

import { cn } from "@/lib/utils"

export interface PhaseTab {
  /** planear | hacer | verificar | actuar (SG-SST) o fase1..fase4 (PESV): define el color. */
  key: string
  label: string
  count?: number
}

export interface PhaseTabsProps {
  tabs: PhaseTab[]
  value: string
  onChange: (key: string) => void
}

// Pestañas por fase del ciclo PHVA, con el mismo código de color que los
// anillos del panel general (ver .phase-tab[data-phase=...] en nexo-v5.css).
export function PhaseTabs({ tabs, value, onChange }: PhaseTabsProps) {
  return (
    <div className="phase-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === value}
          data-phase={tab.key}
          className={cn("phase-tab", tab.key === value && "active")}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.count !== undefined ? <span className="cnt">{tab.count}</span> : null}
        </button>
      ))}
    </div>
  )
}
