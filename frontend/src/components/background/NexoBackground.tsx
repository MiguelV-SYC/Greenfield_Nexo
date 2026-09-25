import { NetworkCanvas } from "@/components/background/NetworkCanvas"
import { DigitalWave } from "@/components/background/DigitalWave"

export interface NexoBackgroundTheme {
  /** Extremos del gradiente radial de fondo (hex), claro -> oscuro */
  gradientFrom: string
  gradientTo: string
  networkAccent: [number, number, number]
  waveCore: [number, number, number]
  waveEdge: [number, number, number]
}

// Paleta institucional SST (azul petróleo + teal), la que ya existía.
const SST_THEME: NexoBackgroundTheme = {
  gradientFrom: "#0B4F6C",
  gradientTo: "#08344A",
  networkAccent: [44, 166, 164],
  waveCore: [94, 234, 212],
  waveEdge: [11, 79, 108],
}

// Fondo animado del login: gradiente institucional + red de nodos (NetworkCanvas)
// + ola de datos inferior (DigitalWave). No es un Client Component: delega toda
// interactividad/canvas a sus hijos, que sí llevan "use client". Recibe un
// `theme` opcional para reutilizarse en otras verticales de Nexo (Calidad,
// Sostenibilidad) con su propia paleta; por defecto usa la paleta SST.
export function NexoBackground({
  theme = SST_THEME,
}: {
  theme?: NexoBackgroundTheme
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at 80% 15%, ${theme.gradientFrom}, ${theme.gradientTo} 65%)`,
      }}
    >
      <DigitalWave coreColor={theme.waveCore} edgeColor={theme.waveEdge} />
      <NetworkCanvas accent={theme.networkAccent} />
    </div>
  )
}
