import type { ReactNode } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/PageHeader"
import { EmptyState } from "@/components/app/primitives"
import { NAVIGATION, findModule, type NavModule, type SystemId } from "@/lib/navigation"

function PendingPort({ navModule }: { navModule: NavModule }) {
  return (
    <EmptyState title="Diseño aprobado — pendiente de portar">
      Referencia visual: <code>brand/mockup/NexoV.5_mockup.html</code> → <code>#{navModule.mockupView}</code>.
      Se porta a React en el bolt de construction de este módulo.
    </EmptyState>
  )
}

export interface ModulePageProps {
  system: SystemId
  slug: string
  /** Contenido ya portado; si falta se muestra el estado del mockup. */
  children?: ReactNode
}

// Página estándar de un módulo del sidebar: cabecera con los textos del
// mockup + contenido. Sin `children`: si el mockup marca el módulo como
// "en definición" se muestra ese estado vacío (es el diseño aprobado); si no,
// un aviso de vista pendiente de portar.
export function ModulePage({ system, slug, children }: ModulePageProps) {
  const navModule = findModule(system, slug)
  if (!navModule) notFound()

  const fallback = navModule.emptyState ? (
    <EmptyState title={navModule.emptyState.title}>{navModule.emptyState.text}</EmptyState>
  ) : (
    <PendingPort navModule={navModule} />
  )

  return (
    <>
      <PageHeader
        breadcrumb={navModule.breadcrumb}
        title={navModule.title}
        subtitle={navModule.subtitle}
        actions={navModule.actions}
      />
      {children ?? fallback}
    </>
  )
}

/** Parámetros estáticos de las rutas /[sistema]/[modulo] (excluye el panel índice). */
export function moduleStaticParams(system: SystemId) {
  return NAVIGATION[system]
    .flatMap((group) => group.items)
    .filter((item) => item.slug !== "")
    .map((item) => ({ modulo: item.slug }))
}

export function moduleMetadata(system: SystemId, slug: string): Metadata {
  const navModule = findModule(system, slug)
  return { title: navModule ? `${navModule.label} | Nexo` : "Nexo" }
}
