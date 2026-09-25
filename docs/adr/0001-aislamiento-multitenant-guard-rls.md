# ADR-0001: Aislamiento multi-tenant con guard + Row-Level Security

- **Estado**: aceptada (pendiente de la firma G2 de `specs/organizaciones/`)
- **Fecha**: 2026-09-25
- **Origen**: `CONTEXTO-NEXO.md` §12, decisión abierta 2 · `specs/organizaciones/design.md` DEC-1

## Contexto

Nexo usa una sola base de datos PostgreSQL compartida por todas las
organizaciones. Mostrarle datos de una organización a otra es el
riesgo número uno del producto (`CONTEXTO-NEXO.md` §5). La decisión
abierta era si basta con un guard de NestJS que filtre por
organización, o si además la base de datos debe imponer el filtro.

## Decisión

**Guard + Row-Level Security (RLS) de Postgres**, para todo el repo:

1. El guard resuelve la identidad (usuario, rol de plataforma y,
   en los módulos tenant, la organización activa del token).
2. Una extensión de Prisma abre cada operación en una transacción y
   fija las variables de sesión con `set_config(..., true)`, que solo
   viven dentro de esa transacción: `app.usuario_id` y `app.es_admin`.
   Los módulos que operan dentro de una organización agregarán
   `app.organizacion_id` cuando se construyan.
3. Cada tabla de negocio tiene `ENABLE` y `FORCE ROW LEVEL SECURITY`
   con políticas sobre esas variables.
4. La aplicación se conecta con un rol sin `BYPASSRLS` que no es dueño
   de las tablas (`nexo_app`); las migraciones usan otro
   (`nexo_migrador`), que sí tiene `BYPASSRLS`: `FORCE ROW LEVEL SECURITY`
   también aplica al dueño y las migraciones de datos deben ver todas las
   filas. Ese rol no lo usa nunca la aplicación.
5. Toda feature con endpoints mantiene su test de aislamiento
   (`stack/testing.md`), que ahora falla tanto si falla el guard como
   si falla la política.

## Alternativas descartadas

- **Solo guard**: un único punto de falla. Una consulta que olvide el
  filtro expone datos de otra organización.
- **Guard ahora y RLS después**: migrar más tarde obliga a revisar
  todas las consultas ya escritas, justo cuando ya hay datos reales.

## Consecuencias

- Cada operación de Prisma va dentro de una transacción; no se puede
  usar `SET` a nivel de sesión porque el pool de conexiones se comparte
  entre peticiones.
- Las migraciones incluyen SQL para las políticas; revisar políticas es
  parte del code review de cada módulo.
- Los catálogos globales (DIVIPOLA, CIIU, ARL) no llevan RLS y son de
  solo lectura para `nexo_app`.
- Un índice único global (como el del NIT) sigue comprobándose aunque
  la fila en conflicto no sea visible por RLS.
