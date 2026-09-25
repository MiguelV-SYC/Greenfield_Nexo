# Tech stack

> **Servicio**: `nexo`
> **Estado**: completo (bootstrap 2026-09-25). Fuente: `CONTEXTO-NEXO.md` §4.

> El Service Agent se **negará a generar código** mientras este archivo
> tenga un `TODO` **que no cuelgue de nada** — lenguaje, framework,
> persistencia o testing sin decidir. Razón: sin eso, los `design.md`
> salen genéricos y los tests no pueden trazar a las convenciones
> reales.
>
> **Un `TODO` que cuelga de una `D-N` aceptada en G2 con `MOCK` y
> `Ready to unmock` no bloquea**: bloquea producción, no el trabajo
> contra el doble. Si bloqueara, una spec cuyo stack espera a un
> tercero no llegaría nunca al código. La tabla está en
> `/spec-implement`.

## Lenguaje y framework

TypeScript en modo `strict` en todo el monorepo.

| Paquete | Framework | Notas |
|---|---|---|
| `backend/` | **NestJS 12** sobre **Node.js 24** | API REST y cálculo centralizado de indicadores. Swagger (`@nestjs/swagger`) obligatorio en cada endpoint |
| `frontend/` | **Next.js 16** (App Router, RSC) + **React 19** | Base visual obligatoria: `nexo-design-kit` |

Librerías de frontend:

| Uso | Librería |
|---|---|
| Estilos / UI | Tailwind CSS 4 + design system V5 (`src/styles/nexo-v5.css`) + shadcn (`base-mira`) + Hugeicons. Tipografías Inter, Inter Tight y JetBrains Mono |
| Cuadrícula interactiva | TanStack Table v8 (recomendada; decisión abierta, ver `stack/architecture.md` § ADRs) |
| Gráficas | Chart.js 4 (mismo motor que el mockup aprobado) |
| Formularios / validación | React Hook Form + Zod |
| Cliente HTTP | `fetch` o Axios con tipos generados desde el OpenAPI de cada spec |

Librerías de backend:

| Uso | Librería |
|---|---|
| Auth | JWT: `@nestjs/jwt` + Passport |
| Colas | BullMQ sobre Redis (recálculo de indicadores, exportaciones pesadas) |
| Excel | ExcelJS (importación inicial de la matriz y exportación) |
| Logs | nestjs-pino |

## Persistencia

| Componente | Tecnología |
|---|---|
| Base de datos | **PostgreSQL 16**, única y compartida entre organizaciones (multi-tenant por `organizacionId`) |
| ORM | **Prisma 7** |
| Caché / colas | **Redis 7** |
| Archivos (evidencias) | **MinIO**, compatible con S3, detrás de un puerto de almacenamiento |

## Build y package manager

- **pnpm** con workspaces: `backend/` y `frontend/` son paquetes del
  workspace raíz. Se commitea `pnpm-lock.yaml`.
- Build: `nest build` (backend) y `next build` (frontend).

## Tests

Jest en ambos paquetes; Supertest para las pruebas HTTP del backend.
La política está en `stack/testing.md`.

## Lint y formato

- ESLint + `eslint-plugin-sonarjs` y Prettier en ambos paquetes.
- SonarQube Community: opcional, local (ver infra local).

## Infra local

Podman / Docker Compose con `postgres`, `redis` y `minio`. SonarQube,
si se levanta, va en otro puerto porque MinIO ya usa el 9000.

## Deploy target

**TBD** (`repo-config.yaml > runtime.type`). Hasta que se decida, solo
existe la infra local con Compose. Se resuelve antes de la primera
feature que requiera desplegar a `pruebas`.

## Versiones pineadas

| Componente | Versión |
|---|---|
| Node.js | 24.x (fijado en `.nvmrc` y `engines`) |
| NestJS | 12.x |
| Next.js | 16.x |
| React | 19.x |
| Prisma | 7.x |
| PostgreSQL | 16 |
| Redis | 7 |
| Tailwind CSS | 4.x |
| TanStack Table | 8.x |
| Chart.js | 4.x |

Las versiones exactas quedan fijadas por `pnpm-lock.yaml`.
