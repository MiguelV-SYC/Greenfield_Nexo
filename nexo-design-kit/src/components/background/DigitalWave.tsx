"use client"

import { useEffect, useRef } from "react"
import { createNoise2D } from "simplex-noise"

interface Particle {
  x: number
  y: number
  radius: number
  edgeFactor: number // 0 = centro de la ola (brillante), 1 = borde (tenue)
  phase: number
}

const PARTICLE_AREA = 190
const MIN_PARTICLES = 1600
const MAX_PARTICLES = 5200
const TRAVEL_SPEED = 0.00028
const TRAVEL_FREQUENCY = 0.006

function lerpColor(a: [number, number, number], b: [number, number, number], t: number) {
  return `${a[0] + (b[0] - a[0]) * t}, ${a[1] + (b[1] - a[1]) * t}, ${a[2] + (b[2] - a[2]) * t}`
}

// Por defecto: núcleo cian brillante, borde azul institucional oscuro
// (pensado para el fondo navy del login). Otras pantallas pueden pasar su
// propio par core/edge, ej. los verdes de marca sobre un fondo claro.
const DEFAULT_CORE_COLOR: [number, number, number] = [94, 234, 212]
const DEFAULT_EDGE_COLOR: [number, number, number] = [11, 79, 108]

interface DigitalWaveProps {
  coreColor?: [number, number, number]
  edgeColor?: [number, number, number]
}

export function DigitalWave({
  coreColor = DEFAULT_CORE_COLOR,
  edgeColor = DEFAULT_EDGE_COLOR,
}: DigitalWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const canvas: HTMLCanvasElement = canvasEl
    const ctx2d = canvas.getContext("2d")
    if (!ctx2d) return
    const ctx: CanvasRenderingContext2D = ctx2d

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const noise2D = createNoise2D()
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frameId = 0
    const startTime = performance.now()

    // Línea central de la ola: un barrido diagonal (más alto a la izquierda,
    // más bajo a la derecha, como en la referencia) más dos octavas de ruido
    // encima para que no se vea un tilt perfectamente recto/artificial.
    function centerlineY(x: number) {
      const tilt = (x / width) * height * 0.3
      const n1 = noise2D(x * 0.0016, 12.4)
      const n2 = noise2D(x * 0.004, 87.1)
      return height * 0.58 + tilt + n1 * height * 0.07 + n2 * height * 0.025
    }

    function makeParticles() {
      const bandHalfWidth = height * 0.26
      const target = Math.min(
        MAX_PARTICLES,
        Math.max(MIN_PARTICLES, Math.round((width * bandHalfWidth * 2) / PARTICLE_AREA))
      )

      const next: Particle[] = []
      let attempts = 0
      const maxAttempts = target * 10

      while (next.length < target && attempts < maxAttempts) {
        attempts++
        const x = Math.random() * width
        const center = centerlineY(x)
        // Distribución tipo gaussiana (suma de uniformes) para concentrar
        // partículas cerca del centro de la ola y desvanecerlas hacia el borde.
        const spread = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
        const y = center + spread * bandHalfWidth
        if (y < 0 || y > height) continue

        const distanceFactor = Math.min(1, Math.abs(spread))
        // Máscara de densidad: en zonas de baja densidad de ruido, se
        // exige estar más cerca del centro para sobrevivir (crea claros
        // orgánicos en vez de un relleno uniforme).
        const densityMask = (noise2D(x * 0.01, y * 0.01) + 1) / 2
        if (densityMask < distanceFactor * 0.62) continue

        next.push({
          x,
          y,
          radius: distanceFactor < 0.35 ? Math.random() * 1.3 + 1.0 : Math.random() * 0.9 + 0.5,
          edgeFactor: distanceFactor,
          phase: Math.random() * Math.PI * 2,
        })
      }

      particles = next
    }

    function resize() {
      const parent = canvas.parentElement
      width = parent?.clientWidth ?? window.innerWidth
      height = parent?.clientHeight ?? window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      makeParticles()
    }

    function draw(elapsed: number) {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        const baseOpacity = 0.8 * (1 - p.edgeFactor) + 0.14
        const shimmer = reduceMotion
          ? 1
          : 0.55 + 0.45 * Math.sin(p.x * TRAVEL_FREQUENCY - elapsed * TRAVEL_SPEED + p.phase)
        const opacity = Math.max(0, baseOpacity * shimmer)
        if (opacity <= 0.01) continue

        ctx.fillStyle = `rgba(${lerpColor(coreColor, edgeColor, p.edgeFactor)}, ${opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * (0.85 + 0.15 * shimmer), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function loop(now: number) {
      draw(now - startTime)
      frameId = requestAnimationFrame(loop)
    }

    resize()
    if (reduceMotion) {
      draw(0)
    } else {
      frameId = requestAnimationFrame(loop)
    }

    const observer = new ResizeObserver(() => resize())
    if (canvas.parentElement) observer.observe(canvas.parentElement)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [coreColor, edgeColor])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
