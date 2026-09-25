<!--
  PLANTILLA AI-DLC — tasks.md (canonical: .agents/templates/spec/)
  Se llena DESPUÉS de que design.md esté firmado. Es el desglose
  ejecutable que /spec-implement recorre.

  GUARDRAILS de derivación:
  - Organizar por FASES: Setup → Foundational (bloqueante) → una fase
    por slice (P1, P2... de requirements.md) → Polish. Implementar
    sólo Setup + Foundational + P1 debe dar algo desplegable a
    `pruebas` (MVP — alimenta partial-deploy, §3.10).
  - Cada task cita los R*.* que cubre y las D-N de las que depende
    (ejemplo de formato: `[R<x>.<y>, D<n>]`). Una task sin R*.* es
    sospechosa (¿es chore?).
  - Marcar [P] sólo si la task es PARALELIZABLE dentro de su fase:
    toca archivos distintos y no depende de otra task de la misma
    fase. Sin [P] = secuencial en el orden listado.
  - Tasks bloqueadas por dependencias externas: `[D1=LIVE]` — quedan
    `blocked` en status.md con blocked_by.
  - Cada fase cierra con un CHECKPOINT: condición observable de que
    la fase está completa (tests verdes del slice, build OK, etc.).
  - Tamaño: S (< 1h), M (media jornada), L (1+ día). Una task L
    probablemente deba partirse.
-->
# Tasks: Organizaciones

Derivado el 2026-09-25 del `design.md` firmado en G2 (commit `9ad3f16`).

## Fase 0 — Setup

## T1 — Raíz del monorepo pnpm [S]
- **Cubre**: — (chore de scaffolding; `stack/tech-stack.md` § Build)
- **Archivos**: `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.npmrc`, `.prettierrc.json`, `.prettierignore`, `tsconfig.base.json`, `.gitignore`
- **Acceptance**:
  - [x] `packageManager: pnpm@10.34.5` y `engines.node: 24.x`
  - [x] `pnpm -r build`, `pnpm -r lint` y `pnpm -r test` corren desde la raíz

## T2 — Frontend desde `nexo-design-kit` [M]
- **Cubre**: — (DEC-8; habilita R5.*, R3.6)
- **Archivos**: `nexo-design-kit/` → `frontend/` (`git mv`), `frontend/package.json`, borrar `frontend/package-lock.json`
- **Acceptance**:
  - [x] Paquete `@nexo/frontend` del workspace, instalado con pnpm
  - [x] `next build` y `eslint` verdes sin cambiar ninguna pantalla

## T3 — Backend NestJS base [M]
- **Cubre**: — (`stack/architecture.md`, `stack/patterns.md`)
- **Archivos**: `backend/package.json`, `backend/tsconfig*.json`, `backend/nest-cli.json`, `backend/eslint.config.mjs`, `backend/jest.config.ts`, `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/src/common/configuracion.ts`, `backend/test/jest-e2e.config.ts`
- **Acceptance**:
  - [x] Prefijo `/api/v1`, Swagger en `/api/docs`, `ValidationPipe` global, logs con nestjs-pino
  - [x] ESLint prohíbe `console.log` y `any`; incluye `eslint-plugin-sonarjs`
  - [x] `nest build`, `eslint` y `jest` verdes (un test de arranque del módulo raíz)

## T4 — Compose con PostgreSQL y roles [S]
- **Cubre**: — (prerrequisito de DEC-1)
- **Archivos**: `compose.yaml`, `infra/postgres/init/01-roles.sql`, `.env.example`, `backend/.env.example`
- **Acceptance**:
  - [x] `postgres:16` con healthcheck y volumen nombrado
  - [x] Roles `nexo_migrador` (dueño de la base) y `nexo_app` (sin `BYPASSRLS`, sin ser dueño)
  - [x] `compose up` deja la base sana y `nexo_app` puede conectarse

**Checkpoint fase 0**: desde la raíz, `pnpm -r build` y `pnpm -r test`
verdes; `compose up` deja Postgres sano; el frontend sirve las pantallas
del kit sin cambios.

## Fase 1 — Foundational (bloqueante para todos los slices)

## T5 — Prisma: esquema base y migración inicial [M]
- **Cubre**: R1.1, R1.3, R2.1, R2.3, R2.4, R4.2, R6.3 (estructura)
- **Archivos**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/0001_*`, `backend/src/common/prisma/`
- **Acceptance**:
  - [ ] Modelos `Organizacion`, `Sede`, `MiembroOrganizacion`, `AuditoriaCambio` y catálogos de `design.md`
  - [ ] `CHECK (trabajadores >= 1)`, `nit` único, grants de `nexo_app` sin `DELETE` en `AuditoriaCambio`
  - [ ] `prisma migrate deploy` con `nexo_migrador` verde contra Compose

## T6 — RLS y contexto de tenant [M]
- **Cubre**: R6.1, R6.2, NFR3
- **Archivos**: `backend/prisma/migrations/0002_rls/`, `backend/src/common/tenant/`, `backend/test/rls.e2e-spec.ts`
- **Acceptance**:
  - [ ] `ENABLE` + `FORCE ROW LEVEL SECURITY` y políticas de la tabla RLS de `design.md`
  - [ ] Extensión de Prisma: transacción + `set_config(..., true)` por operación
  - [ ] Tests (`// Derived from R6.1`): un usuario sin membresía lee 0 filas; sin contexto, 0 filas; el Administrador lee todas

## T7 — Identidad simulada (D1) [S] [P]
- **Cubre**: R4.9, R6.2, D1
- **Archivos**: `backend/src/common/auth/`, `specs/organizaciones/mocks/usuario-actual.mock.ts`
- **Acceptance**:
  - [ ] Guard con `AUTH_MODO=mock` y cabecera `x-usuario-mock` (DEC-11)
  - [ ] Guard de Administrador para `/admin/*` → `403`
  - [ ] El arranque falla con `AUTH_MODO=mock` y `NODE_ENV=production`

## T8 — Auditoría append-only [S] [P]
- **Cubre**: R6.3, R6.4, NFR4
- **Archivos**: `backend/src/common/auditoria/`
- **Acceptance**:
  - [ ] Servicio que registra quién, cuándo, entidad, acción, valor anterior/nuevo y motivo
  - [ ] Test: `nexo_app` no puede actualizar ni borrar registros de auditoría

## T9 — Catálogos DIVIPOLA, CIIU y ARL [M] [P]
- **Cubre**: R1.9, R2.5, R2.7, D3, D4, D5
- **Archivos**: `backend/prisma/catalogos/*.json`, `backend/prisma/seed.ts`, `backend/src/organizaciones/catalogos/`
- **Acceptance**:
  - [ ] JSON mock del mockup V5 con `CatalogoVersion` (DEC-7)
  - [ ] `GET /catalogos/departamentos`, `/departamentos/:codigo/municipios`, `/ciiu?q=` (máx. 20), `/arl`
  - [ ] Tests de búsqueda CIIU por código y por palabra

**Checkpoint fase 1**: migraciones y seed aplicados sobre Compose; tests
de RLS, auditoría, guard y catálogos verdes.

## Fase 2 — Slice P1 (MVP)

## T10 — Dominio: dígito de verificación [S] [P]
- **Cubre**: R1.5, R1.6
- **Archivos**: `backend/src/organizaciones/dominio/digito-verificacion.ts` (+ `.spec.ts`)
- **Acceptance**:
  - [ ] Tests primero con NIT reales conocidos y casos inválidos (`// Derived from R1.6`)

## T11 — Dominio y endpoint de estándares aplicables [S] [P]
- **Cubre**: R3.1, R3.2, R3.3, R3.4, R3.5, R3.6
- **Archivos**: `backend/src/organizaciones/dominio/estandares-aplicables.ts` (+ `.spec.ts`), `backend/src/organizaciones/estandares.controller.ts`
- **Acceptance**:
  - [ ] Tests primero con los bordes 10/11 y 50/51 y riesgo IV–V con ≤ 50 (62)
  - [ ] `POST /estandares-aplicables/calculo` (DEC-5)

## T12 — Dominio: transiciones de estado [S] [P]
- **Cubre**: R4.3, R4.4, R4.5, R4.6, R4.7, R4.8, R4.10, R8.6
- **Archivos**: `backend/src/organizaciones/dominio/transiciones.ts` (+ `.spec.ts`)
- **Acceptance**:
  - [ ] Tabla de transiciones por estado y rol; toda transición no listada se rechaza

## T13 — Registro de organización [M]
- **Cubre**: R1.1, R1.2, R1.3, R1.4, R1.7, R1.8, R1.9, R2.1, R2.2, R2.5, R2.6, R2.7, R2.8, R3.5, R4.1, R4.2, R6.3
- **Archivos**: `backend/src/organizaciones/organizaciones.{module,controller,service}.ts`, `backend/src/organizaciones/dto/`, `backend/test/organizaciones-registro.e2e-spec.ts`
- **Acceptance**:
  - [ ] `POST /organizaciones` en una transacción: organización, sedes, derivados (DEC-6), membresía y auditoría
  - [ ] `400` por campo, `409` por NIT duplicado en cualquier estado

## T14 — Mis organizaciones y detalle [M]
- **Cubre**: R5.1, R5.2, R5.3, R5.4, R5.5, R5.7, R5.9, R6.1, R6.2, R1.8, D2
- **Archivos**: `backend/src/organizaciones/organizaciones.{controller,service}.ts`, `backend/test/organizaciones-consulta.e2e-spec.ts`
- **Acceptance**:
  - [ ] `GET /organizaciones` con `puedeIngresar` y porcentajes `null` (DEC-12, V9)
  - [ ] `GET /organizaciones/:id` → `404` para no miembros (test de aislamiento)

## T15 — Validación del Administrador [M]
- **Cubre**: R4.3, R4.4, R4.5, R4.9, R4.10, R5.8, R6.4
- **Archivos**: `backend/src/organizaciones/admin-validacion.controller.ts`, `backend/test/organizaciones-validacion.e2e-spec.ts`
- **Acceptance**:
  - [ ] Cola por `enviadaEn` ascendente; aprobar; devolver con motivo no vacío
  - [ ] `403` para no Administrador y `409` fuera de `EN_VALIDACION`

## T16 — Corrección y reenvío [M]
- **Cubre**: R4.6, R4.7, R4.8
- **Archivos**: `backend/src/organizaciones/organizaciones.{controller,service}.ts`, `backend/test/organizaciones-correccion.e2e-spec.ts`
- **Acceptance**:
  - [ ] `PUT /organizaciones/:id` en `DEVUELTA` (incluye NIT); `409` en `EN_VALIDACION`
  - [ ] `POST /organizaciones/:id/reenvio` actualiza `enviadaEn`

## T17 — Frontend: cliente API y Mis organizaciones [M]
- **Cubre**: R5.1, R5.2, R5.3, R5.4, R5.5, R5.6, R5.7, R5.10, R5.11, R1.8, D1, D2
- **Archivos**: `frontend/src/lib/api/`, `frontend/src/app/organizaciones/`, `frontend/src/components/organizaciones/`
- **Acceptance**:
  - [ ] Cliente generado del OpenAPI; tarjetas con estado, "Sin evaluar", motivo de devolución e "Ingresar" solo si `puedeIngresar`
  - [ ] Estados vacío, de carga y de error con reintento (tests de componente)

## T18 — Frontend: asistente de registro, pasos 1–2 [M]
- **Cubre**: R1.1, R1.2, R1.3, R1.4, R1.5, R1.6, R1.7, R2.1, R2.2, R2.5, R2.6, R2.7, R2.8, R3.6, R5.10, R5.11
- **Archivos**: `frontend/src/components/organizaciones/asistente/`
- **Acceptance**:
  - [ ] Portado de `#modal-nueva-organizacion` con las clases V5; regla 0312 corregida (DEC-10)
  - [ ] Vista previa de estándares vía `POST /estandares-aplicables/calculo` con debounce

## T19 — Frontend: cola de validación [M]
- **Cubre**: R4.3, R4.4, R4.5, R5.8, R5.9, R5.10, R5.11
- **Archivos**: `frontend/src/app/admin/validacion/`
- **Acceptance**:
  - [ ] Con primitivas V5 (DEC-9); devolución con `Modal` y motivo obligatorio

## T20 — Integración P1: E2E y accesibilidad [M]
- **Cubre**: R3.6, R5.2, R5.4, R5.6, R5.11, NFR6
- **Archivos**: `frontend/playwright.config.ts`, `frontend/e2e/p1-registro-validacion.e2e.ts`
- **Acceptance**:
  - [ ] Prueba independiente de P1 de `requirements.md` pasa de punta a punta
  - [ ] axe-core sin violaciones `serious`/`critical` en las pantallas de P1

**Checkpoint fase 2**: P1 desplegable a `pruebas` por sí solo —
candidato a primera promoción (`/spec-promote --to pruebas`).

## Fase 3 — Slice P2

## T21 — MinIO y puerto de almacenamiento [M]
- **Cubre**: R7.8, NFR5
- **Archivos**: `compose.yaml` (servicio `minio`), `backend/src/infra/almacenamiento/`
- **Acceptance**:
  - [ ] Bucket con versionado y Object Lock governance 20 años (DEC-3)
  - [ ] Cliente S3/MinIO aprobado antes de instalar (pendiente de OK)

## T22 — Modelo de documentos legales [S]
- **Cubre**: R7.1, R7.4, R7.8
- **Archivos**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/0003_documentos/`
- **Acceptance**:
  - [ ] `DocumentoLegal` con RLS y sin `DELETE` para `nexo_app`

## T23 — Carga, listado y URL firmada [M]
- **Cubre**: R7.2, R7.3, R7.4, R7.6, R7.7, R7.9
- **Archivos**: `backend/src/organizaciones/documentos/`, `backend/test/documentos.e2e-spec.ts`
- **Acceptance**:
  - [ ] Tipo verificado por firma del archivo; `413` sobre 10 MB antes de leer el cuerpo completo
  - [ ] URL firmada de 5 minutos solo para miembros y Administrador

## T24 — Registro multipart y documentos obligatorios [M]
- **Cubre**: R7.5
- **Archivos**: `backend/src/organizaciones/organizaciones.{controller,service}.ts`
- **Acceptance**:
  - [ ] `POST /organizaciones` multipart (DEC-4); `422` con la lista de obligatorios faltantes, también en el reenvío

## T25 — Frontend: paso 3 y documentos en validación [M]
- **Cubre**: R7.1, R7.2, R7.3, R7.5, R7.6, R7.9
- **Archivos**: `frontend/src/components/organizaciones/asistente/`, `frontend/src/app/admin/validacion/`
- **Acceptance**:
  - [ ] Paso 3 del mockup; el Administrador ve los documentos antes de aprobar

**Checkpoint fase 3**: prueba independiente de P2 verde con datos
ficticios. **D6 (BLOCK)**: no se cargan documentos reales del piloto
hasta tener el concepto de jurídica.

## Fase 4 — Slice P3

## T26 — Edición de organización aprobada [M]
- **Cubre**: R8.1, R8.2, R8.3, R8.4, R8.5, R8.6
- **Archivos**: `backend/src/organizaciones/organizaciones.service.ts`, `backend/test/organizaciones-edicion.e2e-spec.ts`
- **Acceptance**:
  - [ ] Auditoría con valor anterior y nuevo por campo y por sede; recálculo de estándares
  - [ ] `409` al cambiar NIT o DV en `APROBADA`

## T27 — Frontend: Configuración editable [M]
- **Cubre**: R8.1, R8.2, R8.3
- **Archivos**: `frontend/src/app/sgsst/config/`
- **Acceptance**:
  - [ ] Portado de `#view-config` (datos generales, sedes, documentos) con edición

**Checkpoint fase 4**: prueba independiente de P3 verde.

## Fase final — Polish

## T28 — Carga con k6 [S]
- **Cubre**: NFR1, NFR2
- **Archivos**: `backend/test/carga/*.k6.js`
- **Acceptance**:
  - [ ] `p(95)<500` en Mis organizaciones con 50 organizaciones; `p(95)<1000` en registro, aprobación y devolución

## T29 — Suite de aislamiento por endpoint [S]
- **Cubre**: NFR3, R6.1
- **Archivos**: `backend/test/aislamiento.e2e-spec.ts`
- **Acceptance**:
  - [ ] Cada endpoint del módulo probado con un usuario de otra organización

## T30 — Accesibilidad completa y cierre [S]
- **Cubre**: NFR6, NFR4, NFR5
- **Archivos**: `frontend/e2e/`, `specs/organizaciones/status.md`
- **Acceptance**:
  - [ ] axe-core en todas las pantallas del módulo (P1–P3)
  - [ ] Verificación de la política de Object Lock del bucket (NFR5) documentada
