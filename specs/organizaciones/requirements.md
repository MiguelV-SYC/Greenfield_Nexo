---
feature: organizaciones
modality: code                  # code | config-only | data-migration | catalog-only | docs-only | refactor-only (§6)
initiative: NONE                # opcional — slug/URL sólo si pertenece a una Initiative
owner: "@MiguelV-SYC"
status: in-implementation       # draft | in-review | approved | in-implementation | done
                                # Quién produce cada transición:
                                #   draft            /spec-new
                                #   in-review        el owner, al pedir revisión de la spec
                                #   approved         firma de G2 (commit `sign`)
                                #   in-implementation  /spec-implement, en su primera task
                                #   done             firma de G5 (§6 Lifecycle)
---
<!--
  PLANTILLA AI-DLC — requirements.md (canonical: .agents/templates/spec/)
  El Service Agent la copia a specs/<feature>/requirements.md durante
  /spec-new y la llena con la entrevista. Las notas en comentarios HTML
  son guardrails para el agente: se CONSERVAN en la spec generada (no
  renderizan y guían amendments futuros). El frontmatter YAML va
  SIEMPRE primero en el archivo (los parsers lo exigen).

  GUARDRAILS (obligatorios al llenar):
  - ✅ QUÉ necesita el usuario y POR QUÉ. ❌ CÓMO se implementa
    (nada de stack, librerías, endpoints internos, estructura de
    código — eso va en design.md).
  - Una acción por requirement. Si tiene "y", dividirlo.
  - NFRs medibles: "rápido" ❌ → "p99 < 500ms" ✅.
  - Casos negativos explícitos (qué hacer ante error/abuso/límite).
  - Cada R*.* debe ser TESTEABLE y NO AMBIGUO: si no puedes escribir
    un test que lo verifique, o admite dos interpretaciones razonables,
    reescribirlo o marcarlo.
  - Ambigüedad: marcar inline con [NEEDS CLARIFICATION: <pregunta
    concreta + opciones>]. MÁXIMO 3 en toda la spec — si necesitas
    más, la captura de intención fue insuficiente: volver a conversar
    con el dev antes de seguir. /spec-clarify los resuelve.
  - NO inventar: lo que no se sabe se marca, no se asume (§3.12).
-->

# Feature: Organizaciones

## Contexto

Nexo es multiempresa: todo lo demás (matriz legal, evidencias,
indicadores) vive dentro de una organización. Este módulo es el
primero del orden de construcción (`CONTEXTO-NEXO.md` §5) y resuelve
cómo una empresa entra a Nexo.

- **Usuario primario**: el **Líder SST**, que registra su organización
  con su identificación legal y sus sedes (centros de trabajo), y luego
  la elige en "Mis organizaciones" para trabajar en ella.
- **Usuario secundario**: el **Administrador de la plataforma**, que
  valida cada organización antes de habilitarla.
- **Valor**: de las sedes sale cuántos **estándares mínimos** de la
  Resolución 0312 de 2019 le aplican a la organización (7, 21 o 62),
  que es el dato del que parte la matriz legal.

**Glosario**: *sede* = *centro de trabajo* (el mockup usa los dos; esta
spec dice **sede**). *Administrador* = Administrador de la plataforma.
*Registro* = alta de la organización por el Líder SST, que la envía a
validación; *reenvío* = nuevo envío de una organización Devuelta.
*Fecha de envío* = momento del último registro o reenvío.

Base visual: `nexo-design-kit` — pantalla `/organizaciones`, asistente
"Registrar nueva organización" (`#modal-nueva-organizacion`) y vista
`#view-config` del mockup `brand/mockup/NexoV.5_mockup.html`. El mockup
manda en lo visual; las reglas de negocio las fija esta spec.

## Stakeholders

- Miguel Angel Villamizar (@MiguelV-SYC) — autor de la spec
- Kevin Arley — revisor de negocio (`CONTEXTO-NEXO.md` §10)
- Jurídica — tratamiento de datos personales (Ley 1581 de 2012, abierta en `stack/security.md`)

## Métricas de éxito

- Un Líder SST registra una organización con una sede y la envía a
  validación en **menos de 5 minutos** (medido en prueba de usabilidad
  con el piloto SYC).
- El **100 %** de las organizaciones aprobadas tienen el número de
  estándares aplicables que dicta la tabla de R3.1–R3.4.
- **Cero** casos de un usuario viendo o modificando una organización
  que no le corresponde.

## Slices priorizados

<!-- Partir la feature en rebanadas INDEPENDIENTES por prioridad.
     P1 = el MVP: lo mínimo que entrega valor observable y es
     desplegable solo (alimenta partial-deploy, §3.10). P2/P3 son
     aditivos — no pueden ser prerequisito de P1.
     Cada slice declara cómo se prueba SIN las demás. Las tasks de
     tasks.md se organizan por slice. -->

### P1 — Registro, sedes y validación (MVP)
- **Por qué esta prioridad**: sin una organización aprobada no existe
  ningún otro módulo; con P1 el piloto SYC ya puede darse de alta.
- **Prueba independiente**: un Líder SST registra una organización con
  dos sedes, ve los estándares aplicables y la envía; el Administrador
  la aprueba; la organización aparece habilitada para ingresar en "Mis
  organizaciones" del Líder SST. Sin documentos (P2) ni edición (P3).
- **Cubre**: R1.*, R2.*, R3.*, R4.*, R5.*, R6.*

### P2 — Documentos legales
- **Por qué esta prioridad**: el Administrador valida con soportes, y
  el Decreto 1072 exige conservarlos; pero P1 ya entrega valor sin
  ellos.
- **Prueba independiente**: sobre una organización ya registrada, el
  Líder SST carga los documentos obligatorios, el envío a validación
  exige los 4 obligatorios y el Administrador los consulta antes de
  aprobar.
- **Cubre**: R7.*

### P3 — Edición desde Configuración
- **Por qué esta prioridad**: los datos cambian con el tiempo (nuevas
  sedes, cambio de ARL), pero al inicio basta con registrarlos bien.
- **Prueba independiente**: sobre una organización aprobada, el Líder
  SST agrega una sede con más trabajadores, los estándares aplicables
  se recalculan y el cambio queda auditado con valor anterior y nuevo.
- **Cubre**: R8.*

## Requisitos funcionales

<!-- EARS (§5): WHEN / WHILE / WHERE / IF-THEN / THE SYSTEM SHALL.
     Numeración estable R<grupo>.<n> — nunca renumerar; las R*.* se
     citan en commits, tests y PRs. Cada R*.* declara `Tests:` con
     niveles: unit | integration | e2e | contract | load |
     accessibility | security | none (este último con justificación). -->

### R1 — Identificación legal [P1]

**R1.1** WHEN un Líder SST registra una organización, THE SYSTEM SHALL
         exigir razón social, NIT y dígito de verificación.
         Tests: unit, integration

**R1.2** THE SYSTEM SHALL aceptar como datos opcionales el nombre
         comercial, el tipo de documento del representante legal (CC,
         CE o Pasaporte), su número y la ARL principal.
         Tests: integration

**R1.3** THE SYSTEM SHALL exigir el tipo de persona (Jurídica o
         Natural), con Jurídica como valor inicial.
         Tests: unit

**R1.4** THE SYSTEM SHALL exigir el nombre completo del representante
         legal.
         Tests: unit

**R1.5** IF el NIT contiene caracteres distintos de dígitos, THEN THE
         SYSTEM SHALL rechazar el registro indicando el campo.
         Tests: unit

**R1.6** IF el dígito de verificación no coincide con el del algoritmo de la DIAN (módulo 11)
         aplicado al NIT, THEN THE SYSTEM SHALL rechazar el registro indicando que el
         dígito de verificación no corresponde al NIT.
         Tests: unit

**R1.7** IF el NIT ya pertenece a otra organización en cualquier estado (En validación,
         Devuelta o Aprobada), THEN THE SYSTEM SHALL rechazar el registro indicando que
         el NIT ya está registrado.
         Tests: integration

**R1.8** WHERE el nombre comercial está vacío, THE SYSTEM SHALL mostrar
         la razón social en su lugar.
         Tests: unit

**R1.9** WHERE se informa la ARL principal, THE SYSTEM SHALL aceptar
         solo un valor del catálogo de ARL (D5).
         Tests: unit

### R2 — Sedes y centros de trabajo [P1]

**R2.1** THE SYSTEM SHALL exigir al menos una sede por organización.
         Tests: unit, integration

**R2.2** WHEN se registra una sede, THE SYSTEM SHALL exigir nombre de la
         sede, dirección, departamento, municipio, clase de riesgo,
         número de trabajadores y actividad económica.
         Tests: unit

**R2.3** THE SYSTEM SHALL aceptar como clase de riesgo solo I, II, III,
         IV o V (Decreto 768 de 2022).
         Tests: unit

**R2.4** IF el número de trabajadores de una sede no es un entero
         mayor o igual a 1, THEN THE SYSTEM SHALL rechazar la sede
         indicando el campo.
         Tests: unit

**R2.5** THE SYSTEM SHALL aceptar como departamento y municipio solo
         valores del catálogo DIVIPOLA (D3).
         Tests: unit

**R2.6** IF el municipio no pertenece al departamento elegido, THEN THE
         SYSTEM SHALL rechazar la sede indicando el campo municipio.
         Tests: unit

**R2.7** THE SYSTEM SHALL aceptar como actividad económica solo un
         código del catálogo CIIU (D4), buscable por código o por
         palabra de la descripción.
         Tests: unit, integration

**R2.8** WHEN el Líder SST quita una sede, THE SYSTEM SHALL impedirlo
         si es la única sede de la organización.
         Tests: unit

### R3 — Estándares mínimos aplicables [P1]

<!-- Regla del Cap. III de la Res. 0312 de 2019 y CONTEXTO-NEXO.md §3.
     Corrige el mockup V5, que asignaba 21 a ≤50 trabajadores con
     riesgo IV–V (ver Clarifications 2026-09-25). -->

Definiciones: **total de trabajadores** = suma de los trabajadores de
todas las sedes; **riesgo máximo** = la clase de riesgo más alta entre
las sedes (I < II < III < IV < V).

**R3.1** WHILE el total de trabajadores es mayor que 50, THE SYSTEM
         SHALL asignar 62 estándares aplicables.
         Tests: unit

**R3.2** WHILE el riesgo máximo es IV o V, THE SYSTEM SHALL asignar 62
         estándares aplicables, sin importar el total de trabajadores.
         Tests: unit

**R3.3** WHILE el total de trabajadores está entre 11 y 50 y el riesgo
         máximo es I, II o III, THE SYSTEM SHALL asignar 21 estándares
         aplicables.
         Tests: unit

**R3.4** WHILE el total de trabajadores es 10 o menos y el riesgo máximo
         es I, II o III, THE SYSTEM SHALL asignar 7 estándares
         aplicables.
         Tests: unit

**R3.5** WHEN cambia la clase de riesgo o el número de trabajadores de
         cualquier sede, THE SYSTEM SHALL recalcular los estándares
         aplicables.
         Tests: unit

**R3.6** WHILE el Líder SST diligencia las sedes, THE SYSTEM SHALL
         mostrar el número de estándares aplicables, el riesgo máximo,
         el total de trabajadores y la regla que se aplicó.
         Tests: e2e

### R4 — Ciclo de validación [P1]

**R4.1** WHEN el Líder SST termina el registro, THE SYSTEM SHALL dejar
         la organización en estado **En validación**.
         Tests: integration

**R4.2** WHEN el Líder SST registra una organización, THE SYSTEM SHALL
         asociarlo a ella con el rol Líder SST.
         Tests: integration

**R4.3** WHEN el Administrador aprueba una organización En validación,
         THE SYSTEM SHALL cambiarla a **Aprobada**.
         Tests: integration

**R4.4** WHEN el Administrador devuelve una organización En validación,
         THE SYSTEM SHALL exigir un motivo no vacío.
         Tests: unit, integration

**R4.5** WHEN el Administrador devuelve una organización con motivo,
         THE SYSTEM SHALL cambiarla a **Devuelta** y conservar el
         motivo.
         Tests: integration

**R4.6** WHILE una organización está Devuelta, THE SYSTEM SHALL
         permitir al Líder SST corregir sus datos y sus sedes.
         Tests: integration

**R4.7** WHEN el Líder SST reenvía una organización Devuelta, THE
         SYSTEM SHALL cambiarla a En validación, sin límite de reenvíos.
         Tests: integration

**R4.8** WHILE una organización está En validación, THE SYSTEM SHALL
         impedir que el Líder SST modifique sus datos y sus sedes.
         Tests: integration

**R4.9** IF un usuario que no es Administrador intenta aprobar o
         devolver una organización, THEN THE SYSTEM SHALL rechazar la
         acción sin cambiar el estado.
         Tests: integration, security

**R4.10** IF se intenta aprobar o devolver una organización que no está
          En validación, THEN THE SYSTEM SHALL rechazar la acción sin
          cambiar el estado.
          Tests: unit, integration

### R5 — Mis organizaciones [P1]

**R5.1** WHEN un Líder SST abre "Mis organizaciones", THE SYSTEM SHALL
         listar todas las organizaciones a las que está asociado, en
         cualquier estado.
         Tests: integration

**R5.2** THE SYSTEM SHALL mostrar por organización: nombre comercial,
         estado, clase de riesgo máxima, ARL, total de trabajadores,
         % de implementación y % de cumplimiento.
         Tests: integration, e2e

**R5.3** WHILE el % de implementación o el % de cumplimiento no está
         disponible (D2), THE SYSTEM SHALL mostrar "Sin evaluar" en su
         lugar.
         Tests: unit

**R5.4** THE SYSTEM SHALL permitir ingresar solo a organizaciones
         Aprobadas.
         Tests: integration, e2e

**R5.5** WHILE una organización está Devuelta, THE SYSTEM SHALL mostrar
         al Líder SST el motivo de la devolución.
         Tests: integration

**R5.6** WHEN un Líder SST no tiene organizaciones, THE SYSTEM SHALL
         mostrar un estado vacío con la acción "Agregar organización".
         Tests: e2e

**R5.7** THE SYSTEM SHALL mostrar al Líder SST el número de
         organizaciones a las que está asociado.
         Tests: integration

**R5.8** WHEN el Administrador abre la lista de validación, THE SYSTEM
         SHALL listar las organizaciones En validación, ordenadas de la
         más antigua a la más reciente por fecha de envío.
         Tests: integration

**R5.9** WHEN el Administrador abre una organización En validación, THE
         SYSTEM SHALL mostrar su identificación legal, sus sedes y sus
         estándares aplicables.
         Tests: integration

**R5.10** WHILE se cargan "Mis organizaciones", la cola de validación o
          los catálogos del asistente, THE SYSTEM SHALL mostrar un
          indicador de carga.
          Tests: unit

**R5.11** IF falla la carga de "Mis organizaciones", de la cola de validación
          o de un catálogo del asistente, THEN THE SYSTEM SHALL mostrar un
          mensaje de error con la opción de reintentar.
          Tests: unit, e2e

### R6 — Aislamiento y auditoría [P1]

**R6.1** IF un Líder SST intenta consultar o modificar una organización
         a la que no está asociado, THEN THE SYSTEM SHALL responder
         como si la organización no existiera.
         Tests: integration, security

**R6.2** THE SYSTEM SHALL permitir al Administrador consultar cualquier
         organización.
         Tests: integration

**R6.3** WHEN una organización cambia de estado, THE SYSTEM SHALL
         registrar en la auditoría quién hizo el cambio, cuándo, el
         estado anterior y el estado nuevo.
         Tests: integration

**R6.4** WHEN el Administrador devuelve una organización, THE SYSTEM
         SHALL registrar el motivo en la auditoría.
         Tests: integration

### R7 — Documentos legales [P2]

**R7.1** THE SYSTEM SHALL manejar por organización los documentos RUT actualizado, Certificado de
         Cámara de Comercio, Cédula del representante legal y Formulario de afiliación a ARL
         (obligatorios), y el Certificado de no afiliación a otra ARL (opcional).
         Tests: unit

**R7.2** WHEN el Líder SST carga un documento, THE SYSTEM SHALL aceptar
         solo archivos PDF o imagen.
         Tests: unit, integration

**R7.3** IF el archivo cargado no es PDF ni imagen, THEN THE SYSTEM
         SHALL rechazarlo indicando los formatos aceptados.
         Tests: unit

**R7.4** WHEN el Líder SST carga un documento que ya existe, THE SYSTEM
         SHALL reemplazarlo conservando la versión anterior.
         Tests: integration

**R7.5** IF faltan documentos obligatorios, THEN THE SYSTEM SHALL
         impedir el envío a validación indicando cuáles faltan.
         Tests: integration

**R7.6** WHILE una organización está En validación, THE SYSTEM SHALL
         permitir al Administrador consultar sus documentos.
         Tests: integration

**R7.7** THE SYSTEM SHALL permitir consultar los documentos solo al
         Líder SST asociado y al Administrador.
         Tests: integration, security

**R7.8** THE SYSTEM SHALL impedir la eliminación de documentos y de sus
         versiones anteriores.
         Tests: integration

**R7.9** IF el archivo cargado supera 10 MB, THEN THE SYSTEM SHALL
         rechazarlo indicando el tamaño máximo permitido.
         Tests: unit, integration

### R8 — Edición desde Configuración [P3]

**R8.1** WHILE una organización está Aprobada, THE SYSTEM SHALL
         permitir al Líder SST editar razón social, nombre comercial,
         tipo de persona, representante legal y ARL.
         Tests: integration

**R8.2** WHILE una organización está Aprobada, THE SYSTEM SHALL
         permitir al Líder SST agregar, editar o quitar sedes,
         respetando R2.*.
         Tests: integration

**R8.3** THE SYSTEM SHALL aceptar como dato opcional el nombre del
         apoderado de la organización.
         Tests: integration

**R8.4** WHEN se edita un dato o una sede, THE SYSTEM SHALL registrar
         en la auditoría quién, cuándo, el valor anterior y el valor
         nuevo.
         Tests: integration

**R8.5** WHEN la edición cambia la clase de riesgo o el número de
         trabajadores de una sede, THE SYSTEM SHALL recalcular los
         estándares aplicables según R3.*.
         Tests: integration

**R8.6** IF se intenta modificar el NIT o el dígito de verificación de
         una organización Aprobada, THEN THE SYSTEM SHALL rechazar el
         cambio sin modificar la organización.
         Tests: unit, integration

## Requisitos no funcionales

**NFR1** THE SYSTEM SHALL responder "Mis organizaciones" con p95 <
         500 ms para un Líder SST asociado a hasta 50 organizaciones.
         Tests: load

**NFR2** THE SYSTEM SHALL completar el registro, la aprobación o la
         devolución de una organización con p95 < 1 s.
         Tests: load

**NFR3** THE SYSTEM SHALL tener cero fugas de datos entre
         organizaciones: toda operación de este módulo sobre una
         organización ajena falla según R6.1.
         Tests: security

**NFR4** THE SYSTEM SHALL auditar el 100 % de los cambios de estado de
         las organizaciones.
         Tests: integration

**NFR5** THE SYSTEM SHALL conservar los documentos legales y sus
         versiones anteriores durante al menos 20 años (Decreto 1072 de
         2015).
         Tests: none — se verifica con la política de retención del
         almacenamiento en design.md; no es automatizable en un test.

**NFR6** THE SYSTEM SHALL cumplir WCAG 2.1 AA en las pantallas de este
         módulo (Mis organizaciones, asistente de registro, cola de
         validación y Configuración): cero violaciones de impacto
         `serious` o `critical` según axe-core.
         Tests: accessibility

## Dependencies

<!-- Omitir si no hay dependencias externas. Formato D-N (§6):
     todo lo que la feature necesita y aún no existe. -->

### D1 — Usuario autenticado y rol (módulo `auth` / `accesos`)
- **Tipo**: técnica
- **Estado**: NEGOTIATING
- **Contrato**: `specs/auth/` — pendiente (id y version se fijan al aprobarse esa spec)
- **Owner**: equipo Nexo / @MiguelV-SYC
- **ETA**: segundo módulo del orden de construcción
- **Estrategia**: MOCK
- **Mock**: `mocks/usuario-actual.mock.ts` — usuario de prueba con rol Líder SST o Administrador
- **Ready to unmock**: `specs/auth/` aprobada en G2 y su endpoint de sesión desplegado en `pruebas`

### D2 — % de implementación y % de cumplimiento (módulo `cumplimiento-normativo`)
- **Tipo**: técnica
- **Estado**: NEGOTIATING
- **Contrato**: `specs/cumplimiento-normativo/` — pendiente
- **Owner**: equipo Nexo / @MiguelV-SYC
- **ETA**: tercer módulo del orden de construcción
- **Estrategia**: MOCK
- **Mock**: sin archivo — la tarjeta muestra "Sin evaluar" (R5.3)
- **Ready to unmock**: `cumplimiento-normativo` expone el % por organización en `pruebas`

### D3 — Catálogo DIVIPOLA (departamentos y municipios)
- **Tipo**: externa
- **Estado**: NEGOTIATING
- **Contrato**: DIVIPOLA del DANE — versión por fijar al descargar
- **Owner**: DANE / @MiguelV-SYC (descarga y versionado)
- **Estrategia**: MOCK
- **Mock**: `mocks/divipola.mock.json` — subconjunto del mockup V5 (33 departamentos, municipios de muestra)
- **Ready to unmock**: catálogo DIVIPOLA completo descargado, con su fecha de corte, versionado en el repo

### D4 — Catálogo CIIU de actividades económicas
- **Tipo**: externa
- **Estado**: NEGOTIATING
- **Contrato**: CIIU Rev. 4 A.C. (DANE) y tabla de actividades del Decreto 768 de 2022 — versión por fijar
- **Owner**: DANE / @MiguelV-SYC (descarga y versionado)
- **Estrategia**: MOCK
- **Mock**: `mocks/ciiu.mock.json` — los 17 códigos del mockup V5
- **Ready to unmock**: catálogo CIIU completo versionado en el repo

### D5 — Catálogo de ARL vigentes
- **Tipo**: humana
- **Estado**: NEGOTIATING
- **Contrato**: lista confirmada por el revisor de negocio — por registrar
- **Owner**: Kevin Arley
- **Estrategia**: MOCK
- **Mock**: `mocks/arl.mock.json` — las 6 del mockup V5 (Aurora, Sura, Positiva, Colmena, Bolívar, Liberty)
- **Ready to unmock**: Kevin Arley confirma la lista de ARL vigentes y queda registrada en esta spec

### D6 — Concepto jurídico sobre la Ley 1581 de 2012
- **Tipo**: humana
- **Estado**: NEGOTIATING
- **Contrato**: concepto escrito de jurídica sobre la retención de 20 años (NFR5, R7.8) frente a los derechos de supresión de datos personales — por registrar
- **Owner**: Jurídica / @MiguelV-SYC (gestiona la solicitud)
- **Estrategia**: BLOCK — P2 se construye y se prueba con datos ficticios; **no se cargan documentos reales del piloto** hasta tener el concepto
- **Ready to unmock**: N/A (BLOCK). Se desbloquea cuando el concepto quede registrado en esta spec y, si ajusta la retención o el borrado, con su `/spec-amend`

## Fuera de scope

- Crear líderes de apoyo y practicantes y asignarles permisos: es del
  módulo `accesos` (sección "Usuarios y accesos" de `#view-config`).
- Los KPIs "Documentos", "Pendientes" y "Alertas activas" del hero de
  "Mis organizaciones". Solo entra el conteo de organizaciones (R5.7).
- Cargar el logo de la organización: las organizaciones nuevas se
  muestran con sus iniciales, como en el mockup.
- Notificaciones por correo o SMS al registrar, aprobar o devolver
  (fuera de v1, `CONTEXTO-NEXO.md` §2).
- Suspender o eliminar una organización aprobada.
- Corregir el NIT de una organización ya aprobada (R8.6).
- Derivar la clase de riesgo a partir del código CIIU: el Líder SST
  elige ambos por separado, como en el mockup.

## Dependencias internas

<!-- Opcional: otras features de este repo. -->
- Depende de: `auth` / `accesos` (D1, con mock), `cumplimiento-normativo` (D2, con mock)
- Bloquea: `auth` / `accesos`, `cumplimiento-normativo`, `indicadores`, `reportes` (todos viven dentro de una organización)

## Clarifications

<!-- Registro persistente de decisiones que cambiaron la spec. NO
     borrar entradas — son la memoria de por qué la spec dice lo que
     dice. Origen: /spec-clarify (sesión de preguntas estructuradas).
     Formato por sesión: -->

### Session 2026-09-25
- Q: ¿Quién registra una organización? → A: El Líder SST la registra y el Administrador de la plataforma la valida; hasta aprobarla no se puede ingresar.
- Q: ¿Cuántos estándares aplican con ≤50 trabajadores y riesgo IV–V? → A: 62, según `CONTEXTO-NEXO.md` §3 y el Cap. III de la Res. 0312 de 2019. El mockup V5 (21) se corrige al portar el asistente.
- Q: ¿Cómo se parte la feature? → A: P1 registro, sedes y validación; P2 documentos legales; P3 edición desde Configuración.
- Q: ¿Qué pasa cuando el Administrador rechaza? → A: La devuelve con motivo obligatorio; el Líder SST corrige y reenvía, sin límite de reenvíos.
- Q: (/spec-clarify) ¿El Líder SST puede editar una organización En validación (R4.8)? → A: No; solo cuando está Devuelta. El Administrador valida exactamente lo enviado, y así no hay edición concurrente con la validación.
- Q: (/spec-clarify) ¿Contra qué estados se rechaza un NIT duplicado (R1.7)? → A: Contra organizaciones en cualquier estado: un NIT corresponde a una sola organización en Nexo. Un segundo líder se vincula después por el módulo `accesos`.
- Q: (/spec-clarify) ¿Tamaño máximo por archivo de un documento legal? → A: 10 MB; si se supera, se rechaza indicando el límite (R7.9 nuevo).
- Q: (/spec-clarify) ¿Se puede editar el NIT de una organización aprobada? → A: No. El NIT y el dígito de verificación solo se corrigen mientras está Devuelta (R4.6); en una Aprobada se rechaza el cambio (R8.6 nuevo). Corregir un NIT ya aprobado queda fuera de v1.
- Q: (revisión G2) ¿Cómo se cubren los estados de carga y error y la accesibilidad (CHK-025)? → A: R5.10 (indicador de carga), R5.11 (error con reintento) y NFR6 (WCAG 2.1 AA, verificado con axe-core); `@axe-core/playwright` aprobado como dependencia.
- Q: (revisión G2) ¿Cómo se cierra la compatibilidad con la Ley 1581 (CHK-022) sin dejar una pregunta abierta? → A: D6 con estrategia BLOCK: P2 se construye con datos ficticios y no se cargan documentos reales del piloto hasta tener el concepto de jurídica.

## OPEN_QUESTIONS

<!-- Preguntas que NO se pudieron resolver en la sesión. Toda entrada
     abierta BLOQUEA el gate G2 (status no puede pasar a approved), y
     también PARA `/spec-design`.

     Por eso, antes de dejar una aquí: ¿es una pregunta o es una `D-N`?
     Si ya sabes QUÉ construir y lo que falta es CON QUÉ, va a
     `Dependencies` con su estrategia, no aquí — y si está en las dos
     listas, ciérrala aquí citando su `D-N`. Ver §6 *Una `D-N` y una
     `OPEN_QUESTION` no son lo mismo*.
     owner y due son obligatorios — spec-lint lo verifica.

     Formato, UNA sola línea por pregunta:

         - [ ] <pregunta> — owner: @<persona>, due: <YYYY-MM-DD>

     El ejemplo vive dentro de este comentario a propósito. Fuera de él
     sería una pregunta abierta de verdad: `spec-lint` la contaría y
     [E8] bloquearía la spec al llegar a `approved`, sin que nadie la
     haya escrito. Una spec recién creada tiene CERO preguntas
     abiertas, y esta sección arranca vacía. -->
