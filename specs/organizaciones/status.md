---
feature: organizaciones
state: not-started
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
| G2 — requirements + design | tech lead | pending |
| G3 — code review (por PR) | 1+ reviewer | pending |
| G4 — QA sign-off | QA | pending |
| G5 — Ops sign-off (pre-prod) | Ops + tech lead | pending |

## Tasks

<!-- Sin tasks todavía: las deriva /spec-implement del design.md firmado en G2. -->

## Dependencies snapshot

D1 (usuario autenticado y rol — auth/accesos): NEGOTIATING
D2 (% implementación y % cumplimiento — cumplimiento-normativo): NEGOTIATING
D3 (catálogo DIVIPOLA): NEGOTIATING
D4 (catálogo CIIU): NEGOTIATING
D5 (catálogo de ARL vigentes): NEGOTIATING
D6 (concepto jurídico Ley 1581 — BLOCK sobre datos reales del piloto): NEGOTIATING

## Notas

- 2026-09-25: spec creada con /spec-new. Base visual: `nexo-design-kit` (pantalla `/organizaciones`, asistente `#modal-nueva-organizacion`, vista `#view-config`). Quedan 2 `[NEEDS CLARIFICATION]` (R1.7, R4.8).
