# Architecture

> **Servicio**: `nexo`
> **Estado**: completo (bootstrap 2026-09-25). Fuente: `CONTEXTO-NEXO.md` §5.

## Estilo arquitectónico

**Monolito modular** en el backend y **frontend separado**; se
comunican solo por API REST. Un solo despliegue de backend mantiene la
operación simple para el piloto. Los límites entre módulos se imponen
en el código para poder extraer un módulo después si hace falta.

## Estructura de carpetas

```
/
├── backend/                     NestJS
│   ├── prisma/                  schema.prisma y migraciones
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/              guards, interceptores, filtros, decoradores transversales
│   │   ├── infra/               adaptadores de integraciones externas (almacenamiento, correo, PDF, exportación)
│   │   └── <modulo>/            un módulo por área del dominio
│   │       ├── <modulo>.module.ts
│   │       ├── <modulo>.controller.ts
│   │       ├── <modulo>.service.ts
│   │       ├── <modulo>.service.spec.ts
│   │       └── dto/
│   └── test/                    pruebas e2e HTTP (Supertest)
├── frontend/                    Next.js (App Router)
│   └── src/
│       ├── app/                 rutas
│       ├── components/
│       ├── lib/                 cliente HTTP y tipos generados desde OpenAPI
│       └── styles/nexo-v5.css
├── specs/                       una carpeta por módulo/feature (SDD)
├── compose.yaml                 postgres, redis, minio
└── pnpm-workspace.yaml
```

Ningún módulo tiene código en `backend/src/<modulo>/` sin
`specs/<modulo>/` aprobado.

Módulos v1, en orden de construcción:
1. `organizaciones`
2. `auth` / `accesos`
3. `cumplimiento-normativo`
4. `indicadores`
5. `reportes`

## Capas y boundaries

- **Controller → Service → Prisma.** El controller solo valida
  (DTOs), autoriza y delega. No contiene lógica de negocio.
- **Entre módulos**: un módulo solo usa a otro a través del service
  que ese módulo exporta. Nunca consulta con Prisma las tablas de otro
  módulo.
- **Puertos y adaptadores solo para integraciones externas**:
  almacenamiento de archivos (MinIO), correo, generación de PDF y
  exportación. El dominio depende de la interfaz (puerto) y el
  adaptador vive en `infra/`. El resto del código no usa esta
  indirección.
- **Multi-tenant en base de datos compartida**:
  - Toda entidad de negocio lleva `organizacionId`.
  - El filtro por organización se aplica en **un solo lugar**
    (guard/interceptor). Ningún service filtra por organización a mano.
  - Mostrarle datos de una organización a otra es el riesgo número uno
    del producto.
- **Indicadores**: se calculan en el backend, nunca en el cliente. El
  frontend solo los muestra.

## Inyección de dependencias

El DI de NestJS. En los tests, los doubles se inyectan con
`Test.createTestingModule(...).overrideProvider(...)`. Los puertos
externos se registran con un token de inyección para poder sustituir
el adaptador.

## Manejo de errores

Convención de NestJS (el contexto no define otra): los services lanzan
excepciones HTTP de Nest (`NotFoundException`, `ForbiddenException`,
etc.) o excepciones de dominio propias que un filtro global traduce a
una respuesta HTTP. No se tragan excepciones en silencio. Un recurso
de otra organización responde `404`, no `403`, para no revelar que
existe.

## Concurrencia / async

- `async/await` en todo el backend.
- Trabajo pesado (recálculo de indicadores, exportaciones grandes) va a
  colas BullMQ sobre Redis. Los jobs son idempotentes y llevan
  `organizacionId`.
- Guardado de la matriz: cada celda se guarda de forma independiente
  por `PATCH`.

## ADRs

Decisiones abiertas que se resuelven en el primer bolt de inception
(`CONTEXTO-NEXO.md` §12) y que se registran como ADR en `docs/adr/`:

1. Cuadrícula: TanStack Table (recomendado) o FortuneSheet.
2. ~~Aislamiento multi-tenant: solo guard, o guard + Row-Level Security
   de Postgres.~~ **Resuelta**: guard + RLS —
   [ADR-0001](../docs/adr/0001-aislamiento-multitenant-guard-rls.md)
   (spec `organizaciones`, DEC-1).
3. Versionado del catálogo de estándares.
4. Origen de las mediciones de indicadores (automáticas o manuales).
5. Fuente de verdad del Excel maestro `decreto_1072.xlsx`.

Cada decisión cuelga del spec que la necesita. Ninguna bloquea los
módulos que no dependen de ella.
