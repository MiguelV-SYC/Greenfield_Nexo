import type { ChronoEntry } from "@/components/app/Chronology"
import type { PhaseProgress } from "@/components/app/ControlDeck"
import type { RiskArea } from "@/components/app/dashboard/RiskPlot"
import type { NavIconName } from "@/components/app/NavIcon"

// DATOS DE DEMOSTRACIÓN — los mismos del mockup V5 (organización SYC), solo
// para maquetar el panel general. Reemplazar por llamadas al backend.

export const DEMO_VERIFIED_PCT = 31

export const DEMO_PHASES: PhaseProgress[] = [
  { phase: "planear", label: "Planear", done: 17, total: 20, href: "/sgsst/cumplimiento?fase=planear" },
  { phase: "hacer", label: "Hacer", done: 1, total: 30, href: "/sgsst/cumplimiento?fase=hacer" },
  { phase: "verificar", label: "Verificar", done: 0, total: 4, href: "/sgsst/cumplimiento?fase=verificar" },
  { phase: "actuar", label: "Actuar", done: 0, total: 4, href: "/sgsst/cumplimiento?fase=actuar" },
]

export const DEMO_RISK_AREAS: RiskArea[] = [
  { name: "Soporte técnico", probability: 0.8, impact: 0.85, level: "alto" },
  { name: "Desarrollo", probability: 0.5, impact: 0.55, level: "medio" },
  { name: "Administración", probability: 0.45, impact: 0.5, level: "medio" },
  { name: "Recepción", probability: 0.2, impact: 0.25, level: "bajo" },
]

export interface PendingFormat {
  name: string
  meta: string
  icon: NavIconName
}

export const DEMO_PENDING_FORMATS: PendingFormat[] = [
  { name: "Acta de reunión COPASST", meta: "Vinculado a 1.1.6", icon: "inspecciones-gen" },
  { name: "Registro de examen médico", meta: "3 pendientes", icon: "examen-medico" },
  { name: "Inspección de puesto de trabajo", meta: "Vinculado a 4.2.4", icon: "inspecciones-gen" },
]

export const DEMO_WORKER_STATS = [
  { label: "Trabajadores activos", value: "128" },
  { label: "Capacitación al día", value: "94%" },
]

export const DEMO_CHRONOLOGY: ChronoEntry[] = [
  { id: "c1", status: "overdue", date: "Hace 5 días", text: <><b>3 exámenes médicos vencidos</b> · Trabajadores</> },
  { id: "c2", status: "done", date: "Ayer", text: "Plan de trabajo anual actualizado" },
  { id: "c3", status: "done", date: "Ayer", text: <><b>Harold Rein</b> cerró la acción correctiva #A-014</> },
  { id: "c4", status: "done", date: "Hoy, 08:14", text: <><b>Carolina Velandia</b> actualizó el estado de 2.7.1 a Cumple</> },
  { id: "c5", status: "done", date: "Hace 2 horas", text: <><b>Kevin Arley</b> subió una nueva versión de &quot;Acta N°07&quot;</> },
  { id: "c6", status: "pending", date: "Vence en 6 días", text: "COPASST: faltan actas Q3" },
  { id: "c7", status: "pending", date: "Vence en 6 días", text: "Capacitación alturas por vencer" },
]
