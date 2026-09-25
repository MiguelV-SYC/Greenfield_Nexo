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

- [ ] CHK-001 ¿Cada slice (P1/P2/P3) declara su prueba independiente? [Estructura]
- [ ] CHK-002 ¿Todos los flujos de error/excepción tienen un R*.* (IF/THEN)? [Gap]
- [ ] CHK-003 ¿Los casos límite (vacío, máximo, concurrencia, duplicados) están contemplados? [Gap]
- [ ] CHK-004 ¿"Fuera de scope" lista lo que un lector podría asumir incluido? [Estructura]

## Claridad

- [ ] CHK-005 ¿Cero adjetivos sin métrica ("rápido", "intuitivo", "robusto", "escalable")? [Claridad]
- [ ] CHK-006 ¿Cero marcadores [NEEDS CLARIFICATION] pendientes? [Claridad]
- [ ] CHK-007 ¿Cada R*.* admite UNA sola interpretación razonable? [Claridad]
- [ ] CHK-008 ¿Los términos de dominio se usan consistentemente (sin sinónimos intercambiados)? [Claridad]

## Testeabilidad

- [ ] CHK-009 ¿Cada R*.* tiene `Tests:` declarado con niveles concretos (o `none` justificado)? [Cobertura]
- [ ] CHK-010 ¿Cada R*.* es verificable por un test automatizable? [Cobertura]
- [ ] CHK-011 ¿Las métricas de éxito son medibles sin leer el código? [Cobertura]

## Consistencia

- [ ] CHK-012 ¿Ningún R*.* contradice a otro R*.* o a un NFR? [Conflicto]
- [x] CHK-013 ¿El conflict scan cross-spec (3.c) corrió y sus hallazgos están resueltos o documentados? [Conflicto] — 2026-09-25: `specs/` no tenía otras features; sin conflictos.

## Dependencias y supuestos

- [ ] CHK-014 ¿Toda dependencia externa está declarada como D-N con estado y estrategia? [Gap]
- [ ] CHK-015 ¿Las OPEN_QUESTIONS abiertas tienen owner y due? (0 abiertas para firmar G2) [Estructura]
- [ ] CHK-016 ¿Los supuestos tomados como default están escritos (no implícitos en la cabeza del autor)? [Gap]

## Items específicos de esta feature

- [ ] CHK-017 ¿La regla de estándares aplicables (R3.1–R3.4) cubre sin huecos ni solapes todas las combinaciones de total de trabajadores y riesgo máximo, incluidos los bordes 10/11 y 50/51? [R3.1]
- [ ] CHK-018 ¿Está definido qué ve y qué puede hacer cada rol (Líder SST, Administrador) en cada estado (En validación, Devuelta, Aprobada)? [R4.8]
- [ ] CHK-019 ¿Está definido qué pasa si el Administrador aprueba o devuelve mientras el Líder SST está corrigiendo la misma organización (concurrencia)? [Gap]
- [ ] CHK-020 ¿El aislamiento entre organizaciones está expresado como comportamiento observable, sin depender de cómo se implementa? [R6.1]
- [ ] CHK-021 ¿Se define el tamaño máximo por archivo de los documentos legales y qué pasa si se supera? [Gap]
- [ ] CHK-022 ¿La retención de 20 años y la imposibilidad de borrar documentos son compatibles con la Ley 1581 de 2012 (datos personales del representante legal)? [R7.8]
- [ ] CHK-023 ¿Está definido si el NIT y el dígito de verificación se pueden editar después de aprobada la organización? [Gap]
- [ ] CHK-024 ¿Los catálogos DIVIPOLA, CIIU y ARL declaran la versión o fecha de corte con la que se validan los datos? [R2.5]
- [ ] CHK-025 ¿Los estados de UI del flujo (sin organizaciones, cargando, error, organización Devuelta) están cubiertos por al menos un R*.*, y hay un criterio de accesibilidad WCAG 2.1 AA verificable para el asistente? [R5.6]
