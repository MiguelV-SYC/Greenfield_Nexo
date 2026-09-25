import { AppShell } from "@/components/app/AppShell"

// TODO: el nombre de la organización sale de la sesión / organización elegida
// en /organizaciones. "SYC" es el dato de demostración del mockup.
export default function SgsstLayout({ children }: LayoutProps<"/sgsst">) {
  return (
    <AppShell system="sgsst" orgName="SYC">
      {children}
    </AppShell>
  )
}
