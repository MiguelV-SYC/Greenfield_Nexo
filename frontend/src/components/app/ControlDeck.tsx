import type { CSSProperties } from "react"
import Link from "next/link"

export type PhvaPhase = "planear" | "hacer" | "verificar" | "actuar"

export interface PhaseProgress {
  phase: PhvaPhase
  label: string
  done: number
  total: number
  href: string
}

function pct(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

// "Torre de control": sello circular de % verificado + un anillo por fase
// PHVA con su color propio (--planear, --hacer, --verificar, --actuar).
export function ControlDeck({ verifiedPct, phases }: { verifiedPct: number; phases: PhaseProgress[] }) {
  return (
    <div className="control-deck">
      <div className="stamp" style={{ "--pct": verifiedPct } as CSSProperties}>
        <div className="stamp-inner">
          <div className="stamp-value">{verifiedPct}%</div>
          <div className="stamp-label">Verificado</div>
        </div>
      </div>
      <div className="instrument-cluster">
        {phases.map((p) => {
          const value = pct(p.done, p.total)
          const ring = { "--ring-color": `var(--${p.phase})`, "--pct": value } as CSSProperties
          return (
            <Link key={p.phase} href={p.href} className="instrument">
              <div className="instrument-ring" style={ring}>
                <span className="instrument-ring-value">{value}%</span>
              </div>
              <div className="instrument-label">{p.label}</div>
              <div className="instrument-meta">
                {p.done}/{p.total}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
