# Testing

> **Servicio**: `nexo`
> **Estado**: completo (bootstrap 2026-09-25). Fuente: `CONTEXTO-NEXO.md` §4 y §11.

## Niveles obligatorios

| Nivel | Cuándo | Herramienta |
|---|---|---|
| **Unit** | Todo service y toda lógica de dominio (cálculo de indicadores, % verificado, estándares aplicables según la Res. 0312) | Jest |
| **Integración HTTP** | Todo endpoint: validación, permisos por rol y aislamiento entre organizaciones | Jest + Supertest contra Postgres real |
| **Componentes (frontend)** | Componentes con lógica: matriz editable, formularios | Jest + React Testing Library |
| **E2E de navegador** | Todo `R*.*` que declare `Tests: e2e`: flujos de usuario completos contra backend real | Playwright |
| **Carga** | Todo NFR que declare `Tests: load`, con el umbral del NFR como criterio de aprobación | k6 |
| **Accesibilidad** | Todo `R*.*`/NFR que declare `Tests: accessibility`: cero violaciones `serious` o `critical` | `@axe-core/playwright` dentro de los E2E |

- **Aislamiento multi-tenant**: toda feature con endpoints tiene al
  menos un test que intenta acceder a datos de otra organización y
  comprueba que falla.

## Cobertura mínima

**≥ 80 %** de líneas, por paquete (`backend/` y `frontend/`). Solo se
excluye del cálculo: `main.ts`, módulos `*.module.ts`, DTOs sin
lógica, código generado (cliente Prisma, tipos OpenAPI) y
`prisma/migrations/`. Cualquier otra exclusión se justifica en el
`design.md` de la spec.

## Frameworks

- Jest en ambos paquetes (runner y cobertura).
- Supertest para HTTP en el backend.
- React Testing Library para componentes del frontend.
- Playwright para E2E de navegador (Chromium; los demás navegadores
  cuando exista CI).
- k6 para carga: cada script declara los `thresholds` del NFR que
  cubre (ej. `http_req_duration: ['p(95)<500']`).

## Convención `// Derived from R*.*`

Cada test debe declarar el `R*.*` que cubre como comment al inicio:

```ts
// Derived from R2.3 (% verificado excluye estándares "No aplica")
it('calcula el % verificado solo sobre estándares aplicables', () => { ... });
```

Esto permite a `/spec-verify` cruzar tests ↔ requirements y detectar
tests huérfanos (sin `R*.*` válido tras Amendment) o `R*.*` sin
cobertura.

## Política de mocks

- **Base de datos propia**: no se mockea en integración. Los tests
  corren contra el Postgres de Compose, con una base de datos de test
  que se limpia entre suites.
- **Unit**: se mockean las dependencias del service (otros services,
  Prisma) con `overrideProvider`.
- **Integraciones externas** (MinIO, correo, PDF): doble del puerto.
  MinIO de Compose en integración.
- **D-N no LIVE**: mock según la regla *Ready to unmock* del
  methodology.

## Estructura de archivos

- Unit: co-located, `<archivo>.spec.ts`.
- Integración HTTP: `backend/test/<modulo>.e2e-spec.ts`.
- Componentes: co-located, `<componente>.spec.tsx`.
- E2E: `frontend/e2e/<flujo>.e2e.ts` (Playwright), contra la infra
  de Compose.
- Carga: `backend/test/carga/<escenario>.k6.js`, contra la infra de
  Compose con datos sembrados por el propio script.
- Los scripts de k6 también llevan `// Derived from NFR<n>` al inicio.
- Los nombres de los tests se escriben en español.

## TDD vs test-after

Tests primero en la lógica de dominio (indicadores, % verificado,
estándares aplicables, permisos). Test-after aceptado para
boilerplate (módulos, DTOs, wiring). `/spec-implement` aplica tests
primero por defecto.

## CI gates de tests

- En PR: lint, unit, integración y cobertura ≥ 80 %.
- E2E (Playwright) en PR para los flujos declarados `e2e` del slice
  que cambia.
- Carga (k6): antes de promover a `qa`, no en cada PR.
- OPEN_QUESTION: plataforma de CI. Se decide junto con el deploy
  target. Mientras tanto se ejecuta en local con `pnpm test` antes de
  abrir el PR.
