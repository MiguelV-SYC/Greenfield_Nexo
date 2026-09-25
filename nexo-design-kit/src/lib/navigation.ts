import type { NavIconName } from "@/components/app/NavIcon"

// Estructura del sidebar y metadatos de cada módulo, extraídos 1:1 del mockup
// aprobado (brand/mockup/NexoV.5_mockup.html). `mockupView` es el id de la
// vista en el mockup: la referencia visual a portar en el bolt de cada módulo.
// `emptyState` != null → en el mockup el módulo está "en definición" (ese
// estado vacío ES el diseño aprobado). null → vista con diseño completo en el
// mockup, pendiente de portar a React.

export type SystemId = "sgsst" | "pesv"

export interface ModuleAction {
  label: string
  primary: boolean
}

export interface NavModule {
  /** Segmento de URL: "" = panel del sistema (/sgsst, /pesv). */
  slug: string
  label: string
  icon: NavIconName
  mockupView: string
  breadcrumb: string
  title: string
  subtitle: string
  actions: ModuleAction[]
  emptyState: { title: string; text: string } | null
}

export interface NavGroup {
  title: string
  items: NavModule[]
}

export const SYSTEMS: Record<SystemId, { label: string; basePath: string }> = {
  sgsst: { label: "SG-SST", basePath: "/sgsst" },
  pesv: { label: "PESV", basePath: "/pesv" },
}

export const NAVIGATION: Record<SystemId, NavGroup[]> = {
  sgsst: [
    {
      title: "Sistema de gestión SST",
      items: [
        {
          slug: "",
          label: "Panel general",
          icon: "panel",
          mockupView: "view-general",
          breadcrumb: "SYC / Sistema de gestión SST / Panel general",
          title: "Panel general — Sistema de Gestión SST",
          subtitle: "Decreto 1072 de 2015 · Ciclo 2026 · Actualizado hoy, 08:40",
          actions: [
            {
              label: "Exportar informe",
              primary: false
            },
            {
              label: "+ Diligenciar formato",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "cumplimiento",
          label: "Cumplimiento normativo",
          icon: "cumplimiento",
          mockupView: "view-cumplimiento",
          breadcrumb: "SYC / Sistema de gestión SST / Cumplimiento normativo",
          title: "Cumplimiento normativo",
          subtitle: "Decreto 1072 de 2015 · Ciclo 2026 · Migrado de decreto_1072.xlsx (documento maestro SYC)",
          actions: [
            {
              label: "Exportar a Excel",
              primary: false
            },
            {
              label: "+ Registrar avance",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "matriz",
          label: "Matriz de peligros",
          icon: "matriz",
          mockupView: "view-matriz",
          breadcrumb: "SYC / Sistema de gestión SST / Matriz de peligros",
          title: "Matriz de peligros (IPEVR)",
          subtitle: "Identificación, evaluación y valoración de riesgos",
          actions: [
            {
              label: "+ Nuevo peligro",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "trabajadores",
          label: "Trabajadores",
          icon: "trabajadores",
          mockupView: "view-trabajadores",
          breadcrumb: "SYC / Sistema de gestión SST / Trabajadores",
          title: "Trabajadores",
          subtitle: "800 trabajadores activos (consolidado nacional) · Incluye numerales 3.1.8, 3.1.9, 4.1.4 y 4.2.6",
          actions: [
            {
              label: "Exportar a Excel",
              primary: false
            },
            {
              label: "+ Agregar trabajador",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "incidentes",
          label: "Incidentes",
          icon: "incidentes",
          mockupView: "view-incidentes",
          breadcrumb: "SYC / Sistema de gestión SST / Incidentes",
          title: "Incidentes y accidentes",
          subtitle: "Registro e investigación de eventos de SST",
          actions: [
            {
              label: "+ Reportar evento",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "capacitaciones",
          label: "Capacitaciones",
          icon: "capacitaciones",
          mockupView: "view-capacitaciones",
          breadcrumb: "SYC / Sistema de gestión SST / Capacitaciones",
          title: "Capacitaciones",
          subtitle: "Programa anual de formación en SST",
          actions: [
            {
              label: "+ Nueva capacitación",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "auditorias",
          label: "Auditorías",
          icon: "auditorias",
          mockupView: "view-auditorias",
          breadcrumb: "SYC / Sistema de gestión SST / Auditorías",
          title: "Auditorías",
          subtitle: "Auditorías internas y externas del SG-SST",
          actions: [
            {
              label: "+ Programar auditoría",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "acciones",
          label: "Acciones correctivas",
          icon: "acciones",
          mockupView: "view-acciones",
          breadcrumb: "SYC / Sistema de gestión SST / Acciones correctivas",
          title: "Acciones correctivas y preventivas",
          subtitle: "Resuelve numerales 7.1.1 – 7.1.4 · Origen: incidentes, auditorías o cumplimiento normativo",
          actions: [
            {
              label: "+ Nueva acción",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "comites",
          label: "Comités",
          icon: "comites",
          mockupView: "view-comites",
          breadcrumb: "SYC / Sistema de gestión SST / Comités",
          title: "Comités y equipos SST",
          subtitle: "Resuelve numerales 1.1.6, 1.1.7, 1.1.8 y 5.1.2 · COPASST, COCOLA y Brigada de emergencia en un solo lugar",
          actions: [],
          emptyState: null
        }
      ]
    },
    {
      title: "Módulos complementarios",
      items: [
        {
          slug: "proveedores",
          label: "Proveedores y contratistas",
          icon: "proveedores",
          mockupView: "view-proveedores",
          breadcrumb: "SYC / Módulos complementarios / Proveedores y contratistas",
          title: "Proveedores y contratistas",
          subtitle: "Resuelve numerales 2.9.1 y 2.10.1",
          actions: [
            {
              label: "+ Registrar proveedor",
              primary: true
            }
          ],
          emptyState: {
            title: "Módulo en definición — prioridad media",
            text: "Evaluación y selección de proveedores/contratistas, con checklist de criterios SST y vigencia de documentos (ARL, afiliaciones, certificaciones)."
          }
        },
        {
          slug: "inspecciones-gen",
          label: "Inspecciones",
          icon: "inspecciones-gen",
          mockupView: "view-inspecciones-gen",
          breadcrumb: "SYC / Módulos complementarios / Inspecciones",
          title: "Inspecciones",
          subtitle: "Resuelve numeral 4.2.4 · Instalaciones, maquinaria y equipos (distinto de inspección de vehículos en PESV)",
          actions: [
            {
              label: "+ Nueva inspección",
              primary: true
            }
          ],
          emptyState: {
            title: "Módulo en definición — prioridad media",
            text: "Checklist diligenciable por área/equipo, con periodicidad configurable y evidencia fotográfica."
          }
        },
        {
          slug: "cambio",
          label: "Gestión del cambio",
          icon: "cambio",
          mockupView: "view-cambio",
          breadcrumb: "SYC / Módulos complementarios / Gestión del cambio",
          title: "Gestión del cambio",
          subtitle: "Resuelve numeral 2.11.1",
          actions: [],
          emptyState: {
            title: "Módulo en definición — prioridad baja",
            text: "Registro de cambios organizacionales o técnicos y su evaluación de riesgo asociada antes de implementarlos."
          }
        },
        {
          slug: "mantenimiento",
          label: "Mantenimiento de activos",
          icon: "mantenimiento",
          mockupView: "view-mantenimiento",
          breadcrumb: "SYC / Módulos complementarios / Mantenimiento de activos",
          title: "Mantenimiento de activos e instalaciones",
          subtitle: "Resuelve numeral 4.2.5",
          actions: [],
          emptyState: {
            title: "Módulo en definición — prioridad baja",
            text: "Programación y registro de mantenimiento preventivo/correctivo de instalaciones, equipos y herramientas."
          }
        },
        {
          slug: "bienestar",
          label: "Bienestar",
          icon: "bienestar",
          mockupView: "view-bienestar",
          breadcrumb: "SYC / Módulos complementarios / Bienestar",
          title: "Bienestar y estilos de vida saludable",
          subtitle: "Resuelve numeral 3.1.7",
          actions: [],
          emptyState: {
            title: "Módulo en definición — prioridad baja",
            text: "Campañas de prevención (tabaquismo, alcoholismo, farmacodependencia) y seguimiento de participación."
          }
        },
        {
          slug: "presupuesto",
          label: "Presupuesto SST",
          icon: "presupuesto",
          mockupView: "view-presupuesto",
          breadcrumb: "SYC / Módulos complementarios / Presupuesto SST",
          title: "Presupuesto SST",
          subtitle: "Resuelve numeral 1.1.3",
          actions: [],
          emptyState: {
            title: "Módulo en definición — prioridad baja",
            text: "Partidas presupuestales del SG-SST con seguimiento de ejecución frente a lo planeado."
          }
        },
        {
          slug: "comunicaciones",
          label: "Comunicaciones",
          icon: "comunicaciones",
          mockupView: "view-comunicaciones",
          breadcrumb: "SYC / Módulos complementarios / Comunicaciones",
          title: "Comunicaciones internas",
          subtitle: "Resuelve numeral 2.8.1",
          actions: [],
          emptyState: {
            title: "Módulo en definición — prioridad baja",
            text: "Mecanismos de comunicación y auto-reporte de condiciones de trabajo — puede resolverse también con Formatos y documentos mientras tanto."
          }
        }
      ]
    },
    {
      title: "Transversal",
      items: [
        {
          slug: "reportes",
          label: "Reportes",
          icon: "reportes",
          mockupView: "view-reportes",
          breadcrumb: "SYC / Transversal / Reportes",
          title: "Reportes",
          subtitle: "Exporta la información de cualquier módulo en Excel o PDF, con el formato institucional de Nexo",
          actions: [
            {
              label: "Indicadores de gestión",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "formatos",
          label: "Formatos y documentos",
          icon: "formatos",
          mockupView: "view-formatos",
          breadcrumb: "SYC / Formatos y documentos",
          title: "Formatos y documentos",
          subtitle: "Plantillas estandarizadas, diligenciables y exportables",
          actions: [
            {
              label: "+ Subir documento",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "config",
          label: "Configuración",
          icon: "config",
          mockupView: "view-config",
          breadcrumb: "SYC / Configuración",
          title: "Configuración",
          subtitle: "Identificación legal de la organización y documentos SST — Decreto 1072 de 2015",
          actions: [],
          emptyState: null
        }
      ]
    }
  ],
  pesv: [
    {
      title: "PESV",
      items: [
        {
          slug: "",
          label: "Panel PESV",
          icon: "panel",
          mockupView: "view-pesv-panel",
          breadcrumb: "SYC / PESV / Panel PESV",
          title: "Panel PESV",
          subtitle: "Resolución 40595 de 2022 · Nivel Básico · Auditoría documental SYC, sep–dic 2025",
          actions: [
            {
              label: "Exportar informe",
              primary: false
            },
            {
              label: "+ Diligenciar formato",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "vehiculos",
          label: "Vehículos",
          icon: "vehiculos",
          mockupView: "view-pesv-vehiculos",
          breadcrumb: "SYC / PESV / Vehículos",
          title: "Vehículos",
          subtitle: "Flota registrada",
          actions: [
            {
              label: "+ Registrar vehículo",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "conductores",
          label: "Conductores",
          icon: "conductores",
          mockupView: "view-pesv-conductores",
          breadcrumb: "SYC / PESV / Conductores",
          title: "Conductores",
          subtitle: "Licencias y vigencias",
          actions: [],
          emptyState: {
            title: "Listado de conductores",
            text: "Nombre, licencia, categoría y vigencia — vinculado a Trabajador cuando aplica."
          }
        },
        {
          slug: "inspecciones",
          label: "Inspecciones",
          icon: "inspecciones",
          mockupView: "view-pesv-inspecciones",
          breadcrumb: "SYC / PESV / Inspecciones",
          title: "Inspecciones",
          subtitle: "Diarias y mensuales por vehículo",
          actions: [],
          emptyState: {
            title: "Historial de inspecciones",
            text: "Formato diligenciable por conductor, con evidencia fotográfica y firma digital."
          }
        },
        {
          slug: "mantenimiento",
          label: "Mantenimiento",
          icon: "mantenimiento",
          mockupView: "view-pesv-mantenimiento",
          breadcrumb: "SYC / PESV / Mantenimiento",
          title: "Mantenimiento y control de vehículos",
          subtitle: "Paso 17 · Hoja de vida y registro de mantenimiento — formato RE-RH-63-SST",
          actions: [
            {
              label: "+ Registrar mantenimiento",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "emergencias",
          label: "Emergencias viales",
          icon: "emergencias",
          mockupView: "view-pesv-emergencias",
          breadcrumb: "SYC / PESV / Emergencias viales",
          title: "Emergencias y siniestros viales",
          subtitle: "Paso 12 · Plan de preparación y respuesta ante emergencias viales",
          actions: [],
          emptyState: null
        }
      ]
    },
    {
      title: "Transversal",
      items: [
        {
          slug: "reportes",
          label: "Reportes",
          icon: "reportes",
          mockupView: "view-pesv-reportes",
          breadcrumb: "SYC / PESV / Transversal / Reportes",
          title: "Reportes",
          subtitle: "Exporta la información de cualquier módulo del PESV en Excel o PDF, con el formato institucional de Nexo",
          actions: [
            {
              label: "Panel PESV",
              primary: false
            },
            {
              label: "Indicadores de gestión",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "formatos",
          label: "Formatos y documentos",
          icon: "formatos",
          mockupView: "view-pesv-formatos",
          breadcrumb: "SYC / PESV / Transversal / Formatos y documentos",
          title: "Formatos y documentos PESV",
          subtitle: "Documentos sugeridos por la Resolución 40595 de 2022 para el Nivel Básico",
          actions: [
            {
              label: "+ Subir documento",
              primary: true
            }
          ],
          emptyState: null
        },
        {
          slug: "config",
          label: "Configuración",
          icon: "config",
          mockupView: "view-pesv-config",
          breadcrumb: "SYC / PESV / Transversal / Configuración",
          title: "Configuración PESV",
          subtitle: "Nivel de implementación, responsables y alcance — Resolución 40595 de 2022",
          actions: [],
          emptyState: null
        }
      ]
    }
  ]
}

export function moduleHref(system: SystemId, slug: string): string {
  const base = SYSTEMS[system].basePath
  return slug ? `${base}/${slug}` : base
}

export function findModule(system: SystemId, slug: string): NavModule | undefined {
  return NAVIGATION[system].flatMap((group) => group.items).find((item) => item.slug === slug)
}
