import { AppShell } from "@/components/app/AppShell"

// TODO: el nombre de la organización sale de la sesión (ver src/app/sgsst/layout.tsx).
export default function PesvLayout({ children }: LayoutProps<"/pesv">) {
  return (
    <AppShell system="pesv" orgName="SYC">
      {children}
    </AppShell>
  )
}
