# Contexto del Proyecto: Nexo Greenfield

> Documento de contexto para la metodología AI-DLC + SDD. Toda sesión de IA (y toda persona
> nueva en el equipo) lo lee antes de abrir un bolt. Si algo aquí contradice una spec aprobada
> en `specs/<modulo>/`, gana la spec; si contradice el código, gana este documento o la spec.

## 1. Identidad del Proyecto

- **Nombre:** Nexo
- **Tipo de desarrollo:** Greenfield (repo nuevo; reutiliza solo el diseño aprobado y el conocimiento de dominio del proyecto previo `Nexo_SGSST`).
- **Propósito:** Plataforma multiempresa para gestionar el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST). El primer entregable es la **matriz legal interactiva tipo Excel** (cumplimiento normativo por estándar) y, a partir de sus datos, la **generación de indicadores de gestión**.
- **Usuarios:**
  - **Líder SST:** dueño del sistema en cada organización. Diligencia la matriz, carga evidencias y consulta los indicadores.
  - **Líder de apoyo:** acceso de lectura o edición según los permisos que le asigne el Líder SST.
  - **Practicante:** acceso restringido según los permisos que le asigne el Líder SST.
  - **Administrador de la plataforma:** gestiona organizaciones y accesos.
- **Cliente piloto:** SYC (Sistemas y Computadores), con sedes en varias ciudades de Colombia.

## 2. Alcance

### Dentro del alcance (v1)
1. Matriz legal interactiva de cumplimiento del SG-SST, organizada por ciclo PHVA.
2. Carga y consulta de evidencias por estándar.
3. Cálculo centralizado de indicadores de gestión (estructura, proceso y resultado), con ficha técnica y gráfica.
4. Exportación a Excel de la matriz y de los indicadores.
5. Autenticación y aislamiento de datos por organización (multi-tenant).

### Fuera del alcance (v1)
- Los demás módulos del sidebar: comités, trabajadores, matriz de peligros IPEVR, PESV, etc. Tienen diseño aprobado, pero entran después como bolts propios.
- Firma digital certificada, notificaciones por correo o SMS y el asistente IA funcional (solo existe su UI).

## 3. Dominio y marco normativo

| Norma | Qué aporta al sistema |
|---|---|
| **Decreto 1072 de 2015** (Libro 2, Parte 2, Título 4, Cap. 6) | Obligaciones del SG-SST. Cada fila de la matriz se vincula a su numeral |
| **Resolución 0312 de 2019** | Estándares mínimos según el tamaño y la clase de riesgo de la empresa: **7** (≤10 trabajadores, riesgo I–III), **21** (11–50) y **62** (>50, o riesgo IV–V). Define qué estándares aplican a cada organización |
| **Resolución 40595 de 2022** | PESV (seguridad vial). Fuera de v1, pero el modelo no debe impedirlo |

Conceptos clave:
- **Estándar / numeral:** requisito evaluable, identified por un numeral (ej. `1.1.1`, `2.7.1`). Pertenece a una fase PHVA.
- **Fases PHVA:** Planear, Hacer, Verificar y Actuar. La matriz del piloto tiene **59 estándares**: Planear 21, Hacer 30, Verificar 4 y Actuar 4.
- **Estado de un estándar:** `Cumple` · `En proceso` · `No aplica`.
- **Evidencia:** documento o enlace que soporta el cumplimiento. Cada estándar tiene una lista de evidencias *requeridas*, cada una con su archivo cargado o sin él.
- **% verificado:** proporción de estándares aplicables en estado `Cumple`, total y por fase. Es lo que muestran el sello y los anillos PHVA del panel general.
- **Indicador de gestión:** medición periódica definida en la ficha **RE-RH-37-SST v0.2**. Campos: tipo (ESTRUCTURA / PROCESO / RESULTADO), nombre, definición, cómo se mide, fuente de información, responsable, frecuencia, unidad, a quién se informa, interpretación, meta, fórmula y resultado por año (serie histórica 2017–2026).

## 4. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | **Next.js 16** (App Router, RSC) + **React 19** + TypeScript | Base: `nexo-design-kit` |
| Estilos / UI | Tailwind CSS 4 + design system V5 (`src/styles/nexo-v5.css`) + shadcn (`base-mira`) + Hugeicons | Tipografía: Inter, Inter Tight y JetBrains Mono |
| Cuadrícula interactiva | **TanStack Table v8** (decisión recomendada; ver §12) | Headless, así que respeta el diseño aprobado de la matriz |
| Gráficas | Chart.js 4 | Mismo motor que el mockup aprobado |
| Formularios / validación | React Hook Form + Zod | |
| Cliente HTTP | Axios o `fetch` con tipos generados desde el OpenAPI de cada spec | |
| Backend | **NestJS 12** + Node.js 24 + TypeScript (strict) | API REST y cálculo centralizado de indicadores |
| ORM | Prisma 7 | |
| Persistencia | **PostgreSQL 16** | Base de datos relacional única |
| Archivos (evidencias) | MinIO, compatible con S3 | |
| Caché / colas | Redis 7 (BullMQ para recálculo de indicadores y exportaciones pesadas) | |
| Auth | JWT (`@nestjs/jwt` + Passport) | |
| Docs de API | Swagger (`@nestjs/swagger`) | Obligatorio en cada endpoint |
| Excel | ExcelJS | Importación inicial de la matriz y exportación |
| Logs | nestjs-pino | Prohibido usar `console.log` |
| Pruebas | Jest + Supertest | Cobertura ≥ 80 % |
| Calidad | ESLint + `eslint-plugin-sonarjs`, Prettier y SonarQube Community (opcional) | |
| Infra local | Podman / Docker Compose: postgres, redis, minio (+ sonarqube en otro puerto, porque MinIO ya usa el 9000) | |

## 5. Arquitectura

- **Monolito modular** en el backend y **frontend separado**; se comunican por API REST.
- Un **módulo NestJS por área del dominio**, con `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/` y `*.spec.ts`. El controller no contiene lógica de negocio.
- **Límites entre módulos:** un módulo solo usa a otro a través de su service exportado. Nunca consulta con Prisma las tablas de otro módulo.
- **Multi-tenant en base de datos compartida:**
  - Toda entidad de negocio lleva `organizacionId`.
  - El filtro por organización se aplica en un solo lugar: guard/interceptor, idealmente reforzado con Row-Level Security de Postgres.
  - Mostrarle datos de una organización a otra es el riesgo número uno del producto.
- **Puertos y adaptadores solo para integraciones externas:** almacenamiento de archivos, correo, generación de PDF y exportación.
- **Indicadores calculados en el backend**, nunca en el cliente. El frontend solo los muestra.

Módulos v1 (orden de construcción):
1. `organizaciones`
2. `auth` / `accesos`
3. `cumplimiento-normativo`
4. `indicadores`
5. `reportes`

## 6. Modelo de dominio inicial (propuesta: se cierra en `specs/<modulo>/spec.md`)
- `Organizacion`, `Sede`, `Estandar`, `EvidenciaRequerida`, `EvaluacionEstandar`, `Evidencia`, `Indicador`, `MedicionIndicador`, `AuditoriaCambio`.

## 7. Matriz legal interactiva: requisitos funcionales
Referencia visual aprobada: `brand/mockup/NexoV.5_mockup.html` → `#view-cumplimiento`.
- Columnas: expandir · Numeral · Estándar · Estado (badge) · Responsable · Evidencias (n/m) · Actualizado.
- Comportamiento tipo Excel: Edición en celda, navegación con teclado, orden y filtros. Guardado independiente por `PATCH`.

## 8. Indicadores: requisitos funcionales
Referencia visual aprobada: `#view-indicadores` (SG-SST) y `#view-pesv-indicadores`.
- Agrupados por Estructura / Proceso / Resultado. El backend recalcula mediante cola Redis (BullMQ).

## 9. Diseño UX/UI
- Base obligatoria: `nexo-design-kit`. Fuente WCAG AA (`#1D7D7B`). Numerales en fuente mono.

## 10. Metodología: AI-DLC + SDD
- SDD: Ningún módulo tiene código en `backend/src/<modulo>/` sin `specs/<modulo>/` aprobado.
- Bolts cortos registrados en `.aidlc/bolts/`. Revisor de negocio: Kevin Arley.

## 11. Estándares de código y verificación
- TS estricto (no `any`), funciones ≤ 40 líneas. Idioma de dominio en español. Cobertura ≥ 80 %.

## 12. Decisiones abiertas (resolver en el primer bolt de inception)
1. Cuadrícula: TanStack Table (recomendado) o FortuneSheet.
2. Aislamiento multi-tenant: guard solo o guard + RLS.
3. Versionado del catálogo de estándares.
4. Origen de las mediciones (automáticas vs manuales).
5. Fuente de verdad del Excel maestro `decreto_1072.xlsx`.

## 13. Artefactos de referencia
- `nexo-design-kit/`, `re-rh-37-sst indicadores 2026. 0.2.xlsx`, `_AUDITORIA DOCUMENTAL PESV SYC.xlsm.xlsx`.
