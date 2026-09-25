<!--
  PLANTILLA AI-DLC — checklist de requirements (canonical:
  .agents/templates/spec/). /spec-new la copia a
  specs/<feature>/checklists/requirements.md y la ADAPTA: conserva
  los items base y agrega items específicos de la feature.

  CONCEPTO — "unit tests del requirements": esta checklist valida la
  CALIDAD DE LA REDACCIÓN de la spec, NO la implementación.

  ✅ BIEN (interroga la spec):
    "¿Está cuantificado 'rápido' con un umbral medible?"
    "¿Se define qué pasa cuando el archivo supera el límite?"
  ❌ MAL (testea la implementación — va en tests, no aquí):
    "Verificar que el endpoint retorna 200"
    "Probar que el botón funciona"

  REGLAS:
  - Numeración global CHK-NNN incremental; al agregar items nuevos,
    continuar la numeración (nunca renumerar).
  - ÍTEM NO APLICABLE: se marca `- [~]` con la razón al final —
    `- [~] CHK-NNN <texto> — N/A: <razón>`. NO dejarlo en `- [ ]`
    (spec-lint lo cuenta como pendiente y erra en G2) ni marcarlo
    `- [x]` (queda indistinguible de uno cumplido y la checklist
    miente). Los dos linters aceptan `[~]`: sólo reaccionan a `[ ]`.
  - ≥80% de los items con referencia de trazabilidad: [R<x>.<y>]
    para items sobre un requirement concreto, [Gap] para algo que la
    spec NO cubre y debería, [Conflicto] para inconsistencias.
  - Máximo ~25 items: si hay más, priorizar por riesgo.
  - GATE G2: el tech lead firma G2 sólo con TODOS los items `[x]`
    o `[~]` con razón. spec-lint lo verifica cuando requirements.md
    pasa a status: approved: cualquier `- [ ]` restante es `[E9]`.
-->
# Checklist de requirements: organizaciones

**Propósito**: validar que `requirements.md` está listo para firmar G2.
**Creada**: 2026-09-25 · **Spec**: [requirements.md](../requirements.md)

## Completitud

- [x] CHK-001 ¿Cada slice (P1/P2/P3) declara su prueba independiente? [Estructura] — 2026-09-25 (revisión G2): P1, P2 y P3 declaran su prueba independiente.
- [x] CHK-002 ¿Todos los flujos de error/excepción tienen un R*.* (IF/THEN)? [Gap] — 2026-09-25 (revisión G2): R1.5–R1.7, R2.4, R2.6, R4.9, R4.10, R5.11, R6.1, R7.3, R7.5, R7.9, R8.6.
- [x] CHK-003 ¿Los casos límite (vacío, máximo, concurrencia, duplicados) están contemplados? [Gap] — 2026-09-25 (revisión G2): vacío R5.6, máximo R7.9 y NFR1, concurrencia R4.8, duplicados R1.7.
- [x] CHK-004 ¿"Fuera de scope" lista lo que un lector podría asumir incluido? [Estructura] — 2026-09-25 (revisión G2): Fuera de scope lista 7 exclusiones (accesos, KPIs del hero, logo, notificaciones, suspender, NIT aprobado, CIIU→riesgo).

## Claridad

- [x] CHK-005 ¿Cero adjetivos sin métrica ("rápido", "intuitivo", "robusto", "escalable")? [Claridad] — 2026-09-25 (revisión G2): /spec-verify --pre-g2 no encontró adjetivos sin métrica.
- [x] CHK-006 ¿Cero marcadores [NEEDS CLARIFICATION] pendientes? [Claridad] — 2026-09-25 /spec-clarify: R1.7 y R4.8 resueltos; 0 marcadores.
- [x] CHK-007 ¿Cada R*.* admite UNA sola interpretación razonable? [Claridad] — 2026-09-25 (revisión G2): ambigüedades resueltas en Clarifications 2026-09-25; 0 marcadores.
- [x] CHK-008 ¿Los términos de dominio se usan consistentemente (sin sinónimos intercambiados)? [Claridad] — 2026-09-25: glosario en Contexto (V7 de /spec-verify).

## Testeabilidad

- [x] CHK-009 ¿Cada R*.* tiene `Tests:` declarado con niveles concretos (o `none` justificado)? [Cobertura] — 2026-09-25 (revisión G2): spec-lint --strict sin [W2]; NFR5 con `none` justificado.
- [x] CHK-010 ¿Cada R*.* es verificable por un test automatizable? [Cobertura] — 2026-09-25 (revisión G2): todos con nivel automatizable salvo NFR5 (none justificado, se verifica por la política de retención, DEC-3).
- [x] CHK-011 ¿Las métricas de éxito son medibles sin leer el código? [Cobertura] — 2026-09-25 (revisión G2): tiempo de registro en prueba de usabilidad, % de organizaciones con estándares correctos y conteo de fugas.

## Consistencia

- [x] CHK-012 ¿Ningún R*.* contradice a otro R*.* o a un NFR? [Conflicto] — 2026-09-25 (revisión G2): /spec-verify --pre-g2 sin contradicciones; R1.7 vs R6.1 aceptado en Clarifications.
- [x] CHK-013 ¿El conflict scan cross-spec (3.c) corrió y sus hallazgos están resueltos o documentados? [Conflicto] — 2026-09-25: `specs/` no tenía otras features; sin conflictos.

## Dependencias y supuestos

- [x] CHK-014 ¿Toda dependencia externa está declarada como D-N con estado y estrategia? [Gap] — 2026-09-25 (revisión G2): D1–D6 con estado y estrategia.
- [x] CHK-015 ¿Las OPEN_QUESTIONS abiertas tienen owner y due? (0 abiertas para firmar G2) [Estructura] — 2026-09-25 (revisión G2): 0 OPEN_QUESTIONS.
- [x] CHK-016 ¿Los supuestos tomados como default están escritos (no implícitos en la cabeza del autor)? [Gap] — 2026-09-25 (revisión G2): defaults en Clarifications y DEC-1..DEC-13 de design.md.

## Items específicos de esta feature

- [x] CHK-017 ¿La regla de estándares aplicables (R3.1–R3.4) cubre sin huecos ni solapes todas las combinaciones de total de trabajadores y riesgo máximo, incluidos los bordes 10/11 y 50/51? [R3.1] — 2026-09-25 (revisión G2): ≤10 → 7; 11–50 → 21 (riesgo I–III); >50 o riesgo IV–V → 62. Bordes 10/11 y 50/51 sin hueco ni solape.
- [x] CHK-018 ¿Está definido qué ve y qué puede hacer cada rol (Líder SST, Administrador) en cada estado (En validación, Devuelta, Aprobada)? [R4.8] — 2026-09-25: R4.6, R4.8, R4.9, R5.4, R5.5 y R6.2 definen acciones por rol y estado.
- [x] CHK-019 ¿Está definido qué pasa si el Administrador aprueba o devuelve mientras el Líder SST está corrigiendo la misma organización (concurrencia)? [Gap] — 2026-09-25: R4.8 impide editar En validación y el Administrador solo actúa En validación; no hay solape.
- [x] CHK-020 ¿El aislamiento entre organizaciones está expresado como comportamiento observable, sin depender de cómo se implementa? [R6.1] — 2026-09-25 (revisión G2): R6.1: "responder como si la organización no existiera".
- [x] CHK-021 ¿Se define el tamaño máximo por archivo de los documentos legales y qué pasa si se supera? [Gap] — 2026-09-25: R7.9, máximo 10 MB.
- [x] CHK-022 ¿La retención de 20 años y la imposibilidad de borrar documentos son compatibles con la Ley 1581 de 2012 (datos personales del representante legal)? [R7.8] — 2026-09-25 (revisión G2): no resuelto aún en lo jurídico: declarado como D6 con BLOCK sobre documentos reales del piloto.
- [x] CHK-023 ¿Está definido si el NIT y el dígito de verificación se pueden editar después de aprobada la organización? [Gap] — 2026-09-25: R8.6, no editables en una Aprobada.
- [x] CHK-024 ¿Los catálogos DIVIPOLA, CIIU y ARL declaran la versión o fecha de corte con la que se validan los datos? [R2.5] — 2026-09-25 (revisión G2): D3–D5 fijan versión al desmockear; CatalogoVersion la registra (DEC-7).
- [x] CHK-025 ¿Los estados de UI del flujo (sin organizaciones, cargando, error, organización Devuelta) están cubiertos por al menos un R*.*, y hay un criterio de accesibilidad WCAG 2.1 AA verificable para el asistente? [R5.6] — 2026-09-25 (revisión G2): vacío R5.6, Devuelta R5.5, carga R5.10, error R5.11; accesibilidad NFR6 (WCAG 2.1 AA, axe-core).
