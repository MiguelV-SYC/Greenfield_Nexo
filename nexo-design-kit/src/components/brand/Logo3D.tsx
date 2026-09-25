"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

import { cn } from "@/lib/utils"

export interface Logo3DProps {
  /** "light" = versión para fondos oscuros (landing); "dark" = para fondos claros (tarjeta de login). */
  variant?: "light" | "dark"
  /** Velocidad de giro del núcleo, en grados por segundo (18 en el mockup V5). */
  degreesPerSecond?: number
  className?: string
}

const MODEL_SRC = { light: "/brand/nexo-mark-light.glb", dark: "/brand/nexo-mark.glb" }
const FALLBACK_SRC = { light: "/logo-nexo-mark-white.png", dark: "/logo-nexo-mark.png" }

function createScene() {
  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.5))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(2, 3, 4)
  const fill = new THREE.DirectionalLight(0xffffff, 1.1)
  fill.position.set(-3, -1.5, 2)
  scene.add(key, fill)
  return scene
}

/** Centra el modelo y aleja la cámara lo justo para que quepa con margen. */
function frameModel(root: THREE.Object3D, camera: THREE.PerspectiveCamera) {
  const box = new THREE.Box3().setFromObject(root)
  root.position.sub(box.getCenter(new THREE.Vector3()))
  const size = box.getSize(new THREE.Vector3()).length()
  const fovRad = (camera.fov * Math.PI) / 180
  camera.position.z = (size / 2 / Math.tan(fovRad / 2)) * 1.35
  camera.lookAt(0, 0, 0)
}

function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  return renderer
}

interface SceneOptions {
  modelSrc: string
  degreesPerSecond: number
  onError: () => void
}

/** Monta el render del logo en `canvas` y devuelve la función de limpieza. */
function startLogoScene(canvas: HTMLCanvasElement, { modelSrc, degreesPerSecond, onError }: SceneOptions) {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = createRenderer(canvas)
  } catch {
    onError()
    return () => undefined
  }
  const scene = createScene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  const spin = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : (degreesPerSecond * Math.PI) / 180
  let core: THREE.Object3D | undefined
  let frameId = 0
  let last = performance.now()

  new GLTFLoader().load(modelSrc, (gltf) => {
    frameModel(gltf.scene, camera)
    core = gltf.scene.getObjectByName("core")
    scene.add(gltf.scene)
  }, undefined, onError)

  const observer = new ResizeObserver(() => resize(canvas, renderer, camera))
  observer.observe(canvas)
  function tick(now: number) {
    if (core) core.rotation.y += spin * ((now - last) / 1000)
    last = now
    renderer.render(scene, camera)
    frameId = requestAnimationFrame(tick)
  }
  frameId = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(frameId)
    observer.disconnect()
    renderer.dispose()
  }
}

function resize(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
  const { width, height } = canvas.getBoundingClientRect()
  if (width === 0 || height === 0) return
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

// Isotipo 3D de Nexo: el .glb trae dos nodos raíz, "frame" (hexágono, fijo) y
// "core" (la X + circuitos), y solo gira "core". Si WebGL no está disponible
// o el modelo no carga, muestra el PNG equivalente.
export function Logo3D({ variant = "light", degreesPerSecond = 18, className }: Logo3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    return startLogoScene(canvasRef.current, {
      modelSrc: MODEL_SRC[variant],
      degreesPerSecond,
      onError: () => setFailed(true),
    })
  }, [variant, degreesPerSecond])

  if (failed) {
    return (
      <div className={cn("relative", className)}>
        <Image src={FALLBACK_SRC[variant]} alt="Nexo" fill sizes="352px" className="object-contain" priority />
      </div>
    )
  }
  return <canvas ref={canvasRef} role="img" aria-label="Nexo" className={cn("block", className)} />
}
