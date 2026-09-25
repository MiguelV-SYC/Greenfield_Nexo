# Patterns

> **Servicio**: `nexo`
> **Estado**: completo (bootstrap 2026-09-25). Fuente: `CONTEXTO-NEXO.md` §5 y §11.

## Idioma

El **idioma del dominio es español**: entidades, módulos, rutas,
DTOs, campos y nombres de tests (`Organizacion`, `EvaluacionEstandar`,
`cumplimiento-normativo`). Los términos técnicos del framework se
dejan como vienen (`controller`, `service`, `module`, `dto`, `guard`).

## Naming

### Archivos

kebab-case con el sufijo de rol de NestJS:
`evaluacion-estandar.service.ts`, `crear-evidencia.dto.ts`. En el
frontend, componentes en kebab-case (`matriz-cumplimiento.tsx`).

### Funciones / métodos

camelCase: `calcularPorcentajeVerificado()`.

### Clases / tipos / interfaces

PascalCase, sin prefijo `I` en interfaces: `EvaluacionEstandar`,
`AlmacenamientoArchivos`. DTOs con sufijo `Dto`:
`ActualizarEvaluacionDto`.

### Variables / constantes

camelCase para variables; UPPER_SNAKE_CASE para constantes de módulo:
`MAX_TAMANO_EVIDENCIA_MB`.

### Base de datos

Modelos Prisma en PascalCase y campos en camelCase. Toda entidad de
negocio lleva `organizacionId`.

## Tamaño y forma del código

- Funciones de **40 líneas como máximo**.
- Sin `any` (TS estricto).
- El controller no contiene lógica de negocio.

## Imports

- Alias `@/` → `src/` en cada paquete.
- Orden (lo aplica ESLint): built-in, externos, internos (`@/`),
  relativos.
- Un módulo solo importa de otro su service exportado, nunca sus
  archivos internos.

## Convención de commits

Sin tracker (`repo-config.yaml > trackers: []`):

```
<type>(nexo): T<n> - <desc> [R<x>.<y>]
```

Ejemplo: `feat(nexo): T3 - guardar estado de un estándar [R2.1, R2.4]`.

Commits fuera de una spec (tooling, bootstrap): `chore: <desc>`.

## Branching

- Feature: `feat/<slug>` desde `main`, un worktree por feature.
- Ambientes: `pruebas → qa → main` (`repo-config.yaml >
  promotion_path`). Sin `--force` sobre ramas de ambiente.

## Organización de tests

- Unit: co-located, `<archivo>.spec.ts` junto al archivo que prueban.
- HTTP/e2e del backend: `backend/test/<modulo>.e2e-spec.ts`.
- Cada test lleva `// Derived from R<x>.<y>` (ver `stack/testing.md`).

## Logging

- **nestjs-pino**, en JSON estructurado.
- **Prohibido `console.log`** (lo bloquea ESLint).
- Niveles: `debug` (desarrollo), `info` (eventos de negocio), `warn`,
  `error`.
- Cada línea de log lleva `organizacionId` y el id de la petición.
- No se loguean contraseñas, tokens ni datos personales (ver
  `stack/security.md`).

## Error reporting

Por ahora, logs de error de pino. La herramienta de error tracking se
decide junto con el deploy target (`repo-config.yaml > runtime`).
