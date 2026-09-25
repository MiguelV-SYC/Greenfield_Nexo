import Link from "next/link"

import { Chronology } from "@/components/app/Chronology"
import { ControlDeck } from "@/components/app/ControlDeck"
import { NavIcon } from "@/components/app/NavIcon"
import { Panel } from "@/components/app/primitives"
import { RiskPlot } from "@/components/app/dashboard/RiskPlot"
import {
  DEMO_CHRONOLOGY,
  DEMO_PENDING_FORMATS,
  DEMO_PHASES,
  DEMO_RISK_AREAS,
  DEMO_VERIFIED_PCT,
  DEMO_WORKER_STATS,
} from "@/lib/data/panel-general"

function PendingFormats() {
  return (
    <Panel title="Formatos pendientes" subtitle="Por diligenciar" action={<Link href="/sgsst/formatos">Ver todos &gt;</Link>}>
      {DEMO_PENDING_FORMATS.map((format) => (
        <div key={format.name} className="format-item">
          <div className="format-icon">
            <NavIcon name={format.icon} />
          </div>
          <div>
            <div className="format-name">{format.name}</div>
            <div className="format-meta">{format.meta}</div>
          </div>
          <div className="format-action">Diligenciar &gt;</div>
        </div>
      ))}
      <div className="mt-3 border-t border-(--border) pt-3">
        {DEMO_WORKER_STATS.map((stat) => (
          <div key={stat.label} className="worker-stat">
            <span>{stat.label}</span>
            <b>{stat.value}</b>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// Portada del SG-SST ("Torre de control" del mockup V5): sello + anillos PHVA,
// plot de riesgo IPEVR, formatos pendientes y cronología unificada.
export function PanelGeneral() {
  return (
    <>
      <ControlDeck verifiedPct={DEMO_VERIFIED_PCT} phases={DEMO_PHASES} />
      <div className="control-grid">
        <Panel
          title="Riesgo — matriz IPEVR"
          subtitle="Probabilidad × impacto por área"
          action={<Link href="/sgsst/matriz">Ver todo &gt;</Link>}
        >
          <RiskPlot areas={DEMO_RISK_AREAS} />
        </Panel>
        <PendingFormats />
      </div>
      <Panel title="Cronología" subtitle="Verificado y por vencer, en una sola línea de tiempo">
        <Chronology entries={DEMO_CHRONOLOGY} />
      </Panel>
    </>
  )
}
