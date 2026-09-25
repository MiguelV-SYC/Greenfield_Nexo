# Nexo — Design Kit (UX/UI aprobado)

Template para arrancar un repo greenfield con el diseño ya aprobado de Nexo. Sale de
`Nexo_SGSST` (rama `main`, commit `b6ad7ea`, 2026-09-24) y de **dos fuentes**:

| Tramo del flujo | Fuente | Estado en el kit |
|---|---|---|
| Landing → login → mis organizaciones | `Nexo_SGSST/frontend` (Next.js) | Copiado tal cual + logo 3D en el landing |
| **App: sidebar + módulos** (lo que viene después de elegir organización) | **`brand/mockup/NexoV.5_mockup.html`** (UX/UI aprobada) | Portado a React: shell completo, design system V5, panel general y las 28 rutas del sidebar |

**Regla:** para todo lo que va dentro del app, la fuente de verdad visual es el mockup V5.
Si el kit y el mockup no coinciden, gana el mockup.

## Cómo usarlo

```bash
cp -r nexo-design-kit/ mi-repo/frontend/
cd mi-repo/frontend && npm install && npm run dev
```

| URL | Pantalla |
|---|---|
| `/` | Landing: logo 3D (gira el núcleo de circuitos) + ola + red de nodos + 3 cards de sistemas |
| `/login` | Login SG-SST (hero + tarjeta deslizable) |
| `/organizaciones` | Topbar, hero con KPIs, cards de organización → "Ingresar" lleva a `/sgsst` |
| `/sgsst` | **App V5** — panel general ("torre de control") |
| `/sgsst/<modulo>` | Los 18 módulos restantes del sidebar SG-SST |
| `/pesv`, `/pesv/<modulo>` | Sistema PESV (se cambia con el switch SG-SST / PESV del sidebar) |

Stack: Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn (`base-mira`) ·
Hugeicons · simplex-noise · three.js (logo 3D) · Chart.js (gráficas del app).

## App (diseño V5 aprobado)

### Qué está portado

| Pieza | Archivo |
|---|---|
| Design system V5 completo (tokens + todas las clases del mockup) | `src/styles/nexo-v5.css` |
| Shell: sidebar + main + asistente IA | `src/components/app/AppShell.tsx` |
| Sidebar tipo "lomo de expediente": red de nodos, logo, switch SG-SST/PESV, grupos colapsables, pestaña activa | `src/components/app/Sidebar.tsx` |
| Estructura del sidebar + textos de cada módulo (breadcrumb, título, subtítulo normativo, botones) | `src/lib/navigation.ts` |
| Íconos del sidebar (SVG exactos del mockup) | `src/components/app/NavIcon.tsx` |
| Cabecera de vista (migas, h1, subtítulo, acciones) | `src/components/app/PageHeader.tsx` |
| Página estándar de módulo | `src/components/app/ModulePage.tsx` |
| Panel general: sello % verificado + anillos PHVA, plot IPEVR, formatos pendientes, cronología | `src/components/app/dashboard/PanelGeneral.tsx` |
| Primitivas: `Badge`, `Numeral`, `Panel`, `KpiCard`, `SummaryCard`, `EmptyState` | `src/components/app/primitives.tsx` |
| `ControlDeck`, `Chronology`, `PhaseTabs`, `Modal`, `RiskPlot` | `src/components/app/*` |
| Asistente IA flotante (hexágono + chat, vista previa) | `src/components/app/AiAssistant.tsx` |
| Logo 3D (three.js; solo gira el nodo `core`, el hexágono queda fijo) | `src/components/brand/Logo3D.tsx` + `public/brand/*.glb` |

### Qué muestra cada módulo del sidebar hoy

- **Panel general (SG-SST):** portado completo, con los datos de demo del mockup (`src/lib/data/panel-general.tsx`).
- **9 módulos "en definición"** (proveedores, inspecciones, gestión del cambio, mantenimiento, bienestar, presupuesto, comunicaciones, conductores, inspecciones PESV): muestran el mismo estado vacío que el mockup, que **es** el diseño aprobado.
- **El resto** (cumplimiento, matriz, trabajadores, comités, reportes, indicadores, formatos, configuración, panel PESV, vehículos, etc.): cabecera real + aviso "pendiente de portar" con el id de la vista en el mockup (`#view-cumplimiento`, …).

### Cómo portar una vista del mockup (un bolt por módulo)

1. Abre `brand/mockup/NexoV.5_mockup.html` en el navegador y ubica la vista (`id="view-<modulo>"`).
2. Crea `src/components/app/<modulo>/…` reutilizando las primitivas y las **mismas clases CSS** del mockup
   (ya están todas en `nexo-v5.css`, no hay que escribir estilos nuevos).
3. Crea una ruta propia `src/app/sgsst/<modulo>/page.tsx` que pase el contenido como `children` de
   `<ModulePage system="sgsst" slug="<modulo>">` (la ruta estática tiene prioridad sobre `[modulo]`).
4. Los datos de demo del mockup van a `src/lib/data/`, marcados como demostración, hasta conectar el backend.

`src/app/sgsst/page.tsx` es el ejemplo de referencia de este patrón.

### Cómo convive V5 con el resto

- `nexo-v5.css` está **acotado a `.nexo-app`** (el contenedor del `AppShell`) y va en `@layer components`:
  no afecta landing/login/organizaciones y cualquier utilidad de Tailwind puede sobrescribirlo.
- Dentro de `.nexo-app` los tokens V5 (`--primary`, `--border`, …) reemplazan a los de shadcn.
- Se restauran `line-height: normal` y `box-sizing: content-box` en pseudo-elementos, porque el preflight de
  Tailwind los cambia y el mockup depende de los valores del navegador.

## Paleta y tipografía

### App (V5 — señalética NTC 1461 / ISO 7010)

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#1D7D7B` | Acción primaria, nav activa, sello "Cumple". Es el teal Nexo oscurecido para cumplir WCAG AA con texto blanco (4.92:1) |
| `--ink` / `--ink-soft` | `#08344A` / `#0B4F6C` | Texto de marca |
| `--paper` / `--paper-border` | `#FAF7F1` / `#E7DFCE` | Sidebar ("papel de expediente") |
| `--bg` / `--surface` | `#F6F7F6` / `#FFFFFF` | Fondo / tarjetas |
| `--success` / `--warning` / `--danger` / `--info` | `#2E7D32` / `#E0921E` / `#C62828` / `#2F6FB0` | Estados |
| `--planear` / `--hacer` / `--verificar` / `--actuar` | primary / `#2F6FB0` / `#7A5FB8` / `#E0921E` | Fases PHVA (y fases 1–4 del PESV) |

Tipografía: **Inter** (UI), **Inter Tight** (títulos) y **JetBrains Mono** (cifras, fechas, numerales:
"lectura de instrumento"). Las tres se cargan con `next/font` en `src/app/layout.tsx`.

### Pantallas previas al app

| Vertical | Oscuro | Núcleo | Acento | Fondo claro |
|---|---|---|---|---|
| SG-SST | `#08344A` | `#0B4F6C` | `#2CA6A4` · wave `#5EEAD4` | `#F5F7FA` |
| Quality | `#111C4E` | `#2436A6` | `#7B93FF` | `#F4F6FC` |
| Sostenibilidad | `#0B2E13` | `#1F7A3D` | `#A3E635` | `#F5F9F0` |

## Inventario de marca

| Archivo | Contenido |
|---|---|
| `public/logo-nexo-*.png` | Logos web: mark, mark-white, icon-white, wordmark |
| `public/brand/nexo-mark.glb`, `nexo-mark-light.glb` | Logo 3D (nodos `frame` + `core`) para fondos claros / oscuros |
| `public/brand/nexo-ai-avatar.png` | Avatar del asistente IA (extraído del mockup) |
| `brand/logos/` | Logos fuente en alta resolución |
| `brand/3d/` | Logo 3D fuente (`.glb`, `.obj`) |
| `brand/mockup/NexoV.5_mockup.html` | **Mockup aprobado**: referencia visual de todo el app |
| `public/org-*` | Logos de clientes (solo demo de `/organizaciones`) |

## Pendientes conocidos

- Portar las vistas marcadas "pendiente de portar" (ver lista arriba), una por bolt.
- Sin autenticación: `LoginCard` navega directo y el nombre de la organización ("SYC") está fijo en
  `src/app/sgsst/layout.tsx` y `src/app/pesv/layout.tsx`.
- Las cards Quality y Sostenibilidad del landing apuntan a `/loginquality` y `/loginsostenibilidad`, que no
  vienen en el kit (en el mockup V5 están deshabilitadas).
- El PESV no tiene su propio esquema de color; usa el mismo teal que SG-SST, igual que en el mockup.
- Los PNG del logo pesan 1.6–3 MB; conviene optimizarlos (WebP/SVG).
