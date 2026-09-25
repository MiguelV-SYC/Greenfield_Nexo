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
    (`[R4.1, D2]`). Una task sin R*.* es sospechosa (¿es chore?).
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

<!-- Vacío a propósito: /spec-implement deriva las tasks del design.md firmado en G2 (§4 Fase 3). -->
