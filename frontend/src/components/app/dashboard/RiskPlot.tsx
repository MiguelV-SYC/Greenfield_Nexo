"use client"

import { useEffect, useRef } from "react"
import {
  Chart,
  LinearScale,
  PointElement,
  ScatterController,
  Tooltip,
  type ChartConfiguration,
} from "chart.js"

Chart.register(ScatterController, LinearScale, PointElement, Tooltip)

export interface RiskArea {
  name: string
  /** Probabilidad normalizada 0–1. */
  probability: number
  /** Impacto normalizado 0–1. */
  impact: number
  level: "alto" | "medio" | "bajo"
}

// Colores de estado de nexo-v5.css (--danger, --warning, --success).
const LEVEL_COLOR: Record<RiskArea["level"], string> = {
  alto: "#C62828",
  medio: "#E0921E",
  bajo: "#2E7D32",
}

const GRID = "#EEF0EE"

function axis(title: string) {
  return {
    min: 0,
    max: 1,
    title: { display: true, text: title, font: { size: 10.5 } },
    ticks: { display: false },
    grid: { color: GRID },
  }
}

function buildConfig(areas: RiskArea[]): ChartConfiguration<"scatter"> {
  return {
    type: "scatter",
    data: {
      datasets: areas.map((area) => ({
        label: area.name,
        data: [{ x: area.probability, y: area.impact }],
        backgroundColor: LEVEL_COLOR[area.level],
        pointRadius: 8,
        pointHoverRadius: 10,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: (ctx) => ctx.dataset.label ?? "" } } },
      scales: { x: axis("Probabilidad"), y: axis("Impacto") },
    },
  }
}

// Plot de riesgo IPEVR (probabilidad × impacto por área) del panel general.
export function RiskPlot({ areas }: { areas: RiskArea[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const chart = new Chart(canvasRef.current, buildConfig(areas))
    return () => chart.destroy()
  }, [areas])

  return (
    <>
      <div className="risk-plot-box">
        <canvas ref={canvasRef} aria-label="Matriz de riesgo IPEVR por área" role="img" />
      </div>
      <div className="risk-legend">
        <span><span className="dot" style={{ background: "var(--danger)" }} />Alto</span>
        <span><span className="dot" style={{ background: "var(--warning)" }} />Medio</span>
        <span><span className="dot" style={{ background: "var(--success)" }} />Bajo</span>
      </div>
    </>
  )
}
