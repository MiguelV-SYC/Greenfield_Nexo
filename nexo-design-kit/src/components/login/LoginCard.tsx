"use client"

import { useId, useState, type CSSProperties, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, LockIcon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LogoMark } from "@/components/login/LogoMark"

export interface LoginCardProps {
  /** Ruta a la que navega "Ingresar". */
  destination?: string
  /** Color de acento (links, checkbox marcado) en hex. */
  accentColor?: string
  /** Color de la palabra "Nexo" en el subtítulo, en hex. */
  brandColor?: string
  /** Gradiente CSS del botón "Ingresar". */
  buttonGradient?: string
}

// TODO: reemplazar por la llamada real de autenticación al backend.
// Por ahora, "Ingresar" navega directo a `destination`.
export function LoginCard({
  destination = "/organizaciones",
  accentColor = "#2CA6A4",
  brandColor = "#0B4F6C",
  buttonGradient = "linear-gradient(90deg,#0B4F6C,#2CA6A4)",
}: LoginCardProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const userFieldId = useId()
  const passwordFieldId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push(destination)
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#F5F7FA] p-8 shadow-2xl shadow-black/30">
      <div className="flex flex-col items-center gap-4 text-center">
        <LogoMark className="size-25" />
        <div className="space-y-1.5">
          <h1 className="font-heading text-xl font-bold text-[#08344A]">
            Bienvenido
          </h1>
          <p className="text-sm text-[#2B2E33]/70">
            Ingresa tus credenciales para acceder
            <br />a la plataforma{" "}
            <span className="font-semibold" style={{ color: brandColor }}>
              Nexo
            </span>
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor={userFieldId} className="sr-only">
            Usuario
          </Label>
          <div className="relative">
            <HugeiconsIcon
              icon={UserIcon}
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#2B2E33]/40"
            />
            <Input
              id={userFieldId}
              name="username"
              autoComplete="username"
              placeholder="Usuario"
              className="h-11 rounded-xl border-[#2B2E33]/15 bg-white pl-9 text-[#2B2E33]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={passwordFieldId} className="sr-only">
            Contraseña
          </Label>
          <div className="relative">
            <HugeiconsIcon
              icon={LockIcon}
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#2B2E33]/40"
            />
            <Input
              id={passwordFieldId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Contraseña"
              className="h-11 rounded-xl border-[#2B2E33]/15 bg-white pr-9 pl-9 text-[#2B2E33]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[#2B2E33]/40 hover:text-[#2B2E33]/70"
            >
              <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-x-4 gap-y-1 text-sm">
          <label className="flex shrink-0 items-center gap-2 text-[#2B2E33]/80">
            <Checkbox
              name="remember"
              defaultChecked
              style={{ "--accent-color": accentColor } as CSSProperties}
              className="border-[#2B2E33]/25 data-[checked]:border-(--accent-color) data-[checked]:bg-(--accent-color)"
            />
            Recordarme
          </label>
          <a
            href="#"
            className="font-medium hover:underline"
            style={{ color: accentColor }}
          >
            ¿Olvidaste tu contraseña?
          </a>
          <a
            href="#"
            className="font-medium hover:underline"
            style={{ color: accentColor }}
          >
            Solicitar Acceso
          </a>
        </div>

        <Button
          type="submit"
          className={cn(
            "h-11 w-full rounded-xl text-sm font-bold tracking-wide text-white uppercase",
            "hover:opacity-90"
          )}
          style={{ backgroundImage: buttonGradient }}
        >
          Ingresar
        </Button>
      </form>
    </div>
  )
}
