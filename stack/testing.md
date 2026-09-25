# Testing

> **Servicio**: `nexo`
> **Estado**: completo (bootstrap 2026-09-25). Fuente: `CONTEXTO-NEXO.md` §4 y §11.

## Niveles obligatorios

| Nivel | Cuándo | Herramienta |
|---|---|---|
| **Unit** | Todo service y toda lógica de dominio (cálculo de indicadores, % verificado, estándares aplicables según la Res. 0312) | Jest |
| **Integración HTTP** | Todo endpoint: validación, permisos por rol y aislamiento entre organizaciones | Jest + Supertest contra Postgres real |
| **Componentes (frontend)** | Componentes con lógica: matriz editable, formularios | Jest + React Testing Library |

- **Aislamiento multi-tenant**: toda feature con endpoints tiene al
  menos un test que intenta acceder a datos de otra organización y
  comprueba que falla.
- E2E de navegador: no se exige en v1.

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
- Los nombres de los tests se escriben en español.

## TDD vs test-after

Tests primero en la lógica de dominio (indicadores, % verificado,
estándares aplicables, permisos). Test-after aceptado para
boilerplate (módulos, DTOs, wiring). `/spec-implement` aplica tests
primero por defecto.

## CI gates de tests

- En PR: lint, unit, integración y cobertura ≥ 80 %.
- OPEN_QUESTION: plataforma de CI. Se decide junto con el deploy
  target. Mientras tanto se ejecuta en local con `pnpm test` antes de
  abrir el PR.
