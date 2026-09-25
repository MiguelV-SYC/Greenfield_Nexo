import type { NexoBackgroundTheme } from "@/components/background/NexoBackground"

// Paleta "azul rey" de Nexo Calidad — deliberadamente distinta del azul
// petróleo/teal de Nexo SST (rama main), para que ambas verticales se
// distingan a simple vista aunque compartan logo y componentes.
export const CALIDAD_COLOR = {
  deep: "#111C4E", // fondo oscuro, extremo del gradiente
  royal: "#2436A6", // azul rey, color núcleo de marca
  light: "#3D5AFE", // azul brillante, extremo claro del gradiente/botones
  accent: "#7B93FF", // periwinkle, acento sobre fondo oscuro (red de nodos del login)
  heroAccent: "#4C63D2", // azul medio, acento sobre fondo claro (hero post-login)
  bg: "#F4F6FC", // fondo claro de las vistas post-login
} as const

export const CALIDAD_BACKGROUND_THEME: NexoBackgroundTheme = {
  gradientFrom: CALIDAD_COLOR.royal,
  gradientTo: CALIDAD_COLOR.deep,
  networkAccent: [123, 147, 255],
  waveCore: [140, 170, 255],
  waveEdge: [36, 54, 166],
}

export const CALIDAD_HERO_NETWORK_ACCENT: [number, number, number] = [76, 99, 210]
export const CALIDAD_HERO_WAVE_CORE: [number, number, number] = [76, 99, 210]
export const CALIDAD_HERO_WAVE_EDGE: [number, number, number] = [17, 28, 78]
