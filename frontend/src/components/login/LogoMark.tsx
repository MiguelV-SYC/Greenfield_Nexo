import Image from "next/image"

import { cn } from "@/lib/utils"

// Isotipo real de Nexo (frontend/public/logo-nexo-mark.png, fondo removido
// para que no contraste sobre ninguna superficie). Único punto que referencia
// el archivo: para cambiar el logo alcanza con editar el src de acá.
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/logo-nexo-mark.png"
        alt="Nexo"
        fill
        sizes="120px"
        className="object-contain"
        priority
      />
    </div>
  )
}
