import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ChronoStatus = "done" | "pending" | "overdue"

export interface ChronoEntry {
  id: string
  status: ChronoStatus
  date: string
  text: ReactNode
}

// "Cronología unificada": pasado verificado (punto sólido verde), futuro
// pendiente (punto punteado ámbar) y vencido (rojo) en un solo riel.
export function Chronology({ entries }: { entries: ChronoEntry[] }) {
  return (
    <div className="chrono">
      {entries.map((entry) => (
        <div key={entry.id} className={cn("chrono-item", entry.status)}>
          <div className="chrono-date">{entry.date}</div>
          <div className="chrono-text">{entry.text}</div>
        </div>
      ))}
    </div>
  )
}
