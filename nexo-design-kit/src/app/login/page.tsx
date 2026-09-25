import type { Metadata } from "next"

import { NexoBackground } from "@/components/background/NexoBackground"
import { LoginScreen } from "@/components/login/LoginScreen"

export const metadata: Metadata = {
  title: "Iniciar sesión | Nexo",
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08344A]">
      <NexoBackground />
      <LoginScreen
        label="SG-SST"
        tagline={
          <>
            Conectamos personas, procesos
            <br />y decisiones para entornos más seguros.
          </>
        }
      />
    </div>
  )
}
