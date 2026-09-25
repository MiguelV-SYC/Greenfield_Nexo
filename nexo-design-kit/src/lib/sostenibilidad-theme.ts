import type { NexoBackgroundTheme } from "@/components/background/NexoBackground"

// Paleta "verde limón" de Nexo Sostenibilidad — vivo y saturado, deliberadamente
// distinto del teal institucional de SST y del azul rey de Calidad.
export const SOST_COLOR = {
  deep: "#0B2E13", // fondo oscuro, extremo del gradiente
  forest: "#1F7A3D", // verde núcleo de marca (mid-tone)
  limeBright: "#A3E635", // lima brillante: topbar, red de nodos sobre fondo oscuro
  limeButton: "#65A30D", // lima más oscura: extremo del botón (contraste con texto blanco)
  limeText: "#4D7C0F", // lima oscura: texto/links/checkbox sobre tarjeta blanca
  heroAccent: "#2F8132", // verde medio: red de nodos/ola sobre fondo claro (hero post-login)
  bg: "#F5F9F0", // fondo claro de las vistas post-login
} as const

export const SOST_BACKGROUND_THEME: NexoBackgroundTheme = {
  gradientFrom: SOST_COLOR.forest,
  gradientTo: SOST_COLOR.deep,
  networkAccent: [163, 230, 53],
  waveCore: [190, 242, 100],
  waveEdge: [31, 122, 61],
}

export const SOST_HERO_NETWORK_ACCENT: [number, number, number] = [47, 129, 50]
export const SOST_HERO_WAVE_CORE: [number, number, number] = [47, 129, 50]
export const SOST_HERO_WAVE_EDGE: [number, number, number] = [11, 46, 19]
