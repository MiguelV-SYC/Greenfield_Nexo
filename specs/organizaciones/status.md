---
feature: organizaciones
state: in-progress
methodology_version: "0.170"
updated: 2026-09-25
updated_by: "@MiguelV-SYC"
---
<!--
  PLANTILLA AI-DLC — status.md (canonical: .agents/templates/spec/)
  Materializa el progreso real de la feature. Lo actualiza el Service
  Agent al cerrar cada task (/spec-implement) o el dev a mano si
  commitea fuera del flujo. Formato YAML simple parseable por
  spec-lint y /spec-status. El frontmatter va SIEMPRE primero.

  REGLAS (§6 Lifecycle):
  - `state` se DERIVA de las tasks (algoritmo §6). Si declaración y
    derivación divergen, spec-lint lo reporta como drift (W4).
  - Task `blocked` REQUIERE `blocked_by:` con causa concreta.
  - `updated` = fecha del último commit que tocó este archivo.
  - `methodology_version` = versión AI-DLC con la que se autoreó la
    spec (/spec-new la toma de `.ai-dlc-version` al root). spec-lint
    la usa para NO aplicar retroactivamente reglas posteriores
    (linteo versionado). /spec-amend y los bugs B/C que re-tocan
    requirements la suben a la versión actual — migración al re-tocar,
    nunca en bloque por un upgrade.
  - feature_flag: omitir el bloque entero si la feature no usa flag.
  - Estados de task: pending | blocked | in-progress | done |
    deployed:<env> | cancelled. Estados de feature: not-started |
    in-progress | partial-deploy-<env> | feature-complete | live |
    cancelled | legacy.
-->

# Status

## Gates

<!-- Firma por commit dedicado tipo `sign` (ver AGENTS.md § Gates).
     G2 requiere: checklist de requirements completa + 0
     OPEN_QUESTIONS abiertas + 0 [NEEDS CLARIFICATION] + design.md
     resuelto (lo produce /spec-design) + /spec-verify --pre-g2 sin
     CRITICALs. -->

| Gate | Qué firma | Estado |
|---|---|---|
| G2 — requirements + design | tech lead | ✅ signed 2026-09-25 by m.villamizar@syc.com.co (commit 9ad3f16) |
| G3 — code review (por PR) | 1+ reviewer | pending |
| G4 — QA sign-off | QA | pending |
| G5 — Ops sign-off (pre-prod) | Ops + tech lead | pending |

## Tasks

T1: done | commit 2ac6e22 · 2026-09-25
T2: done | commit fb175c2 · 2026-09-25
T3: done | commit 471d00f · 2026-09-25
T4: done | commit a906343 · 2026-09-25
T5: done | commit fec8684 · 2026-09-25
T6: done | commit 87167b3 · 2026-09-25
T7: done | commit 89329c6, 207493a · 2026-09-25
T8: done | commit 2acbbe0 · 2026-09-25
T9: done | commit ec99372 · 2026-09-25
T10: pending |
T11: pending |
T12: pending |
T13: pending |
T14: pending |
T15: pending |
T16: pending |
T17: pending |
T18: pending |
T19: pending |
T20: pending |
T21: pending |
T22: pending |
T23: pending |
T24: pending |
T25: pending |
T26: pending |
T27: pending |
T28: pending |
T29: pending |
T30: pending |

## Dependencies snapshot

D1 (usuario autenticado y rol — auth/accesos): NEGOTIATING
D2 (% implementación y % cumplimiento — cumplimiento-normativo): NEGOTIATING
D3 (catálogo DIVIPOLA): LIVE — DANE datos.gov.co gdxc-w37w, corte 2025-01-24 (pendiente reflejarlo en requirements.md vía /spec-amend)
D4 (catálogo CIIU): NEGOTIATING
D5 (catálogo de ARL vigentes): NEGOTIATING
D6 (concepto jurídico Ley 1581 — BLOCK sobre datos reales del piloto): NEGOTIATING

## Notas

- 2026-09-25: spec creada con /spec-new. Base visual: `nexo-design-kit` (pantalla `/organizaciones`, asistente `#modal-nueva-organizacion`, vista `#view-config`). Quedan 2 `[NEEDS CLARIFICATION]` (R1.7, R4.8).
- 2026-09-25: G2 firmado por Miguel Angel Villamizar sobre 9ad3f16. Checklist 25/25, 0 OPEN_QUESTIONS, 0 [NEEDS CLARIFICATION], design.md resuelto (DEC-1..DEC-13), /spec-verify --pre-g2 sin CRITICAL. Self-approval: un solo dev/lead. Los [E10] de spec-lint esperan a que /spec-implement derive tasks.md. D6 (Ley 1581) bloquea cargar documentos reales del piloto.
- 2026-09-25: /spec-implement derivó tasks.md (T1–T30, 6 fases).
- 2026-09-25: fase 0 (Setup) completa; checkpoint verde: `pnpm -r build|lint|test` desde la raíz, Postgres sano en Compose y el frontend sirve las pantallas del kit. Desvíos menores de archivos frente a tasks.md: T3 usa `jest.config.js` (no `.ts`, para no depender de ts-node) con proyectos unit+integración en un solo config; T4 usa `01-roles.sh` (no `.sql`) para leer contraseñas del entorno. NestJS 12 es ESM-only: el backend sigue la plantilla oficial CJS (`require(esm)` de Node 24) y Jest corre con `--experimental-vm-modules`.
- 2026-09-25: fase 1 (Foundational) completa; checkpoint verde: migraciones 0001–0002 y siembra aplicadas en Compose, `pnpm -r build|lint|test` (58 tests, 98 % de líneas). Decisiones y desvíos: Prisma 7.10.0 con `@prisma/adapter-pg` + `pg` (aprobados). T6 implementa el contexto de tenant como `BaseDatosTenant.ejecutarComo()` (transacción por unidad de trabajo con `set_config` local) en vez de una extensión de Prisma por operación: cubre registros multi-tabla en una sola transacción. El registro inserta la organización sin RETURNING y fija `app.organizacion_nueva` para crear la membresía (RLS). `nexo_migrador` recibe BYPASSRLS (FORCE aplica al dueño; ADR-0001 actualizado). T9: con el OK del owner de D3 se usó la DIVIPOLA oficial (el mockup no traía códigos DANE); D3 pasa a LIVE y CIIU/ARL siguen en MOCK. Entorno: Postgres en 5433 (el 5432 lo ocupa un PostgreSQL 18 nativo) y los `.env` locales apuntan a la IP de la VM de Podman (infra/README.md). T7 tuvo un commit con lint en rojo (89329c6), corregido en 207493a.
