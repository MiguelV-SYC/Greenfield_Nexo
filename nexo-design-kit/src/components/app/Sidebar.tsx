"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NetworkCanvas } from "@/components/background/NetworkCanvas"
import { NavIcon } from "@/components/app/NavIcon"
import { cn } from "@/lib/utils"
import {
  NAVIGATION,
  SYSTEMS,
  moduleHref,
  type NavGroup,
  type SystemId,
} from "@/lib/navigation"

// Teal Nexo (#2CA6A4) sobre el papel del sidebar; más rápido y con menos
// nodos que en el login porque el contenedor es pequeño (valores del mockup V5).
const SIDEBAR_ACCENT: [number, number, number] = [44, 166, 164]

function isActive(pathname: string, href: string, isIndex: boolean) {
  if (isIndex) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarHero({ system, orgName }: { system: SystemId; orgName: string }) {
  const systemIds = Object.keys(SYSTEMS) as SystemId[]
  return (
    <div className="sidebar-hero">
      <NetworkCanvas accent={SIDEBAR_ACCENT} speed={0.18} minNodes={24} />
      <div className="brand">
        <Image className="brand-logo" src="/logo-nexo-mark.png" alt="Nexo" width={44} height={44} />
        <div>
          Nexo <span>·</span> {orgName}
        </div>
      </div>
      <div className="system-switch">
        {systemIds.map((id) => (
          <Link
            key={id}
            href={SYSTEMS[id].basePath}
            className={cn("system-btn", id === system && "active")}
          >
            {SYSTEMS[id].label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function NavSection({ system, group }: { system: SystemId; group: NavGroup }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <button
        type="button"
        className={cn("nav-section w-[calc(100%-8px)]", collapsed && "collapsed")}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((v) => !v)}
      >
        {group.title} <span className="chevron">⌄</span>
      </button>
      <div className={cn("nav-group-items", collapsed && "collapsed")}>
        {group.items.map((item) => {
          const href = moduleHref(system, item.slug)
          const active = isActive(pathname, href, item.slug === "")
          return (
            <Link
              key={item.slug}
              href={href}
              className={cn("nav-item", active && "active")}
              aria-current={active ? "page" : undefined}
            >
              <span className="icon">
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </>
  )
}

export function Sidebar({ system, orgName }: { system: SystemId; orgName: string }) {
  return (
    <aside className="sidebar">
      <SidebarHero system={system} orgName={orgName} />
      <nav aria-label="Módulos">
        {NAVIGATION[system].map((group) => (
          <NavSection key={group.title} system={system} group={group} />
        ))}
      </nav>
      <Link href="/organizaciones" className="sidebar-footer">
        ‹ Volver a mis organizaciones
      </Link>
    </aside>
  )
}
