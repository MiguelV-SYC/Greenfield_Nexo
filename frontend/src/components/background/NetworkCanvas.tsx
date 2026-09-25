"use client"

import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  glow: boolean
}

// #2CA6A4 (acento Nexo SST) por defecto; otras verticales (Calidad,
// Sostenibilidad) pueden pasar su propio color vía la prop `accent`.
const DEFAULT_ACCENT: [number, number, number] = [44, 166, 164]
const LINK_DISTANCE = 130
const AREA_PER_NODE = 7500
const DEFAULT_MIN_NODES = 55
const DEFAULT_SPEED = 0.05
const MAX_NODES = 150
// Fracción de nodos agrupados en "constelaciones" vs. dispersos sueltos,
// para imitar el look de la referencia (grupos delicados en las esquinas,
// centro despejado para no competir con la tarjeta).
const CLUSTER_SHARE = 0.62
const CLUSTER_COUNT_RANGE: [number, number] = [2, 4]

export interface NetworkCanvasProps {
  accent?: [number, number, number]
  /** Velocidad máxima de deriva de cada nodo (px/frame). El sidebar del app usa 0.18. */
  speed?: number
  /** Mínimo de nodos, para contenedores pequeños (el sidebar del app usa 24). */
  minNodes?: number
}

export function NetworkCanvas({
  accent = DEFAULT_ACCENT,
  speed = DEFAULT_SPEED,
  minNodes = DEFAULT_MIN_NODES,
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ACCENT = accent.join(", ")

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

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let frameId = 0

    function makeNode(x: number, y: number): Node {
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius:
          Math.random() < 0.14
            ? Math.random() * 1.6 + 2.2
            : Math.random() * 1.1 + 0.9,
        glow: Math.random() < 0.16,
      }
    }

    function makeNodes() {
      const target = Math.round((width * height) / AREA_PER_NODE)
      const count = Math.min(MAX_NODES, Math.max(minNodes, target))
      const clusteredCount = Math.round(count * CLUSTER_SHARE)
      const scatteredCount = count - clusteredCount

      const [minClusters, maxClusters] = CLUSTER_COUNT_RANGE
      const clusterCount =
        minClusters + Math.floor(Math.random() * (maxClusters - minClusters + 1))
      // Ancla cada "constelación" en la franja superior (como en la
      // referencia), lejos de la banda vertical central/derecha donde
      // se ubica la tarjeta de login.
      const anchors = Array.from({ length: clusterCount }, () => ({
        x:
          (Math.random() < 0.5
            ? 0.03 + Math.random() * 0.22
            : 0.75 + Math.random() * 0.22) * width,
        y: (0.03 + Math.random() * 0.3) * height,
        spread: height * (0.07 + Math.random() * 0.05),
      }))

      const clustered = Array.from({ length: clusteredCount }, () => {
        const anchor = anchors[Math.floor(Math.random() * anchors.length)]
        const angle = Math.random() * Math.PI * 2
        // Suma de uniformes ~ distribución concentrada hacia el centro del ancla.
        const radius =
          ((Math.random() + Math.random()) / 2) * anchor.spread
        return makeNode(
          anchor.x + Math.cos(angle) * radius,
          anchor.y + Math.sin(angle) * radius
        )
      })

      const scattered = Array.from({ length: scatteredCount }, () =>
        makeNode(Math.random() * width, Math.random() * height)
      )

      nodes = [...clustered, ...scattered]
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
      makeNodes()
    }

    function draw(advance: boolean) {
      ctx.clearRect(0, 0, width, height)

      if (advance) {
        for (const node of nodes) {
          node.x += node.vx
          node.y += node.vy
          if (node.x < -20) node.x = width + 20
          else if (node.x > width + 20) node.x = -20
          if (node.y < -20) node.y = height + 20
          else if (node.y > height + 20) node.y = -20
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - dist / LINK_DISTANCE) * 0.4})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const node of nodes) {
        if (node.glow) {
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            node.radius * 8
          )
          gradient.addColorStop(0, `rgba(${ACCENT}, 0.5)`)
          gradient.addColorStop(1, `rgba(${ACCENT}, 0)`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * 8, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = `rgba(${ACCENT}, 0.95)`
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function loop() {
      draw(true)
      frameId = requestAnimationFrame(loop)
    }

    resize()
    if (reduceMotion) {
      draw(false)
    } else {
      frameId = requestAnimationFrame(loop)
    }

    const observer = new ResizeObserver(() => resize())
    if (canvas.parentElement) observer.observe(canvas.parentElement)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [ACCENT, speed, minNodes])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
