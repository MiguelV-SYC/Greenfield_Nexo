# Security

> **Servicio**: `nexo`
> **Estado**: completo (bootstrap 2026-09-25). Fuente: `CONTEXTO-NEXO.md` §1, §2, §4 y §5.
> Los puntos marcados `OPEN_QUESTION` dependen del deploy target o de
> jurídica. No bloquean el desarrollo local.

## Autenticación

JWT emitido por el propio backend (`@nestjs/jwt` + Passport). Sin
proveedor externo de identidad en v1. El token lleva el `usuarioId`,
el `organizacionId` activo y el rol. La expiración y el refresh se
definen en `specs/auth/`.

## Autorización

Roles (`CONTEXTO-NEXO.md` §1):

| Rol | Alcance |
|---|---|
| **Administrador de la plataforma** | Gestiona organizaciones y accesos. Es el único rol que opera por encima de una organización |
| **Líder SST** | Dueño del sistema en su organización. Diligencia la matriz, carga evidencias, consulta indicadores y asigna permisos a los demás roles |
| **Líder de apoyo** | Lectura o edición, según los permisos que le asigne el Líder SST |
| **Practicante** | Acceso restringido, según los permisos que le asigne el Líder SST |

- RBAC por rol, más permisos por usuario que asigna el Líder SST. El
  catálogo de permisos se cierra en `specs/accesos/`.
- Se expresa con decoradores y guards de NestJS en el controller. Los
  services no deciden permisos.
- **Aislamiento multi-tenant** (riesgo número uno): el
  `organizacionId` sale del token, nunca del body ni de la query. Se
  aplica en un único guard/interceptor. Si además se usa Row-Level
  Security de Postgres es una decisión abierta (ver
  `stack/architecture.md` § ADRs).
- Toda feature con endpoints lleva al menos un test que intenta leer o
  modificar datos de otra organización y comprueba que falla.

## Manejo de secretos

- Desarrollo local: `.env` (ignorado por git) y `.env.example`
  commiteado sin valores reales.
- Nunca hardcodear secretos en el código ni en las specs.
- OPEN_QUESTION: gestor de secretos para los ambientes desplegados.
  Depende de `repo-config.yaml > runtime`.

## PII / datos sensibles

- PII: nombre, correo, documento de identidad y cargo de los usuarios
  y trabajadores.
- **Evidencias del SG-SST**: pueden contener datos de salud de
  trabajadores (dato sensible). Se guardan en MinIO en un bucket
  privado, y se accede a ellas solo con URLs firmadas de corta
  duración, emitidas tras verificar la organización y el permiso.
- No se loguea PII ni el contenido de las evidencias.
- Tráfico con TLS en los ambientes desplegados. Cifrado en reposo:
  OPEN_QUESTION, depende del runtime.

## Compliance

- **SG-SST**: Decreto 1072 de 2015, Resolución 0312 de 2019 (y la
  Resolución 40595 de 2022 más adelante). Los `R*.*` de la matriz y de
  los indicadores trazan a su numeral.
- OPEN_QUESTION (jurídica): aplicación de la **Ley 1581 de 2012**
  (protección de datos personales, Colombia) al tratamiento de datos
  de trabajadores. Se espera que aplique por la PII y los datos de
  salud; hay que confirmarlo antes de cargar datos reales del piloto.

## Residencia de datos

OPEN_QUESTION: sin requisito de residencia declarado. Se revisa junto
con la Ley 1581 y el deploy target.

## Vulnerabilidades

- `pnpm audit` en CI. Las dependencias nuevas siguen la regla de
  `AGENTS.md` (listar, revisar licencia y vulnerabilidades, pedir OK).
- OPEN_QUESTION: SLA por severidad y responsable del triage (depende
  del owner del repo, sin definir).

## Auditoría

- Todo cambio sobre la matriz y las evidencias queda registrado en
  `AuditoriaCambio`: quién, cuándo, organización, entidad, valor
  anterior y valor nuevo. La columna "Actualizado" de la matriz se
  alimenta de ahí.
- También se auditan los inicios de sesión y los cambios de
  permisos.
- OPEN_QUESTION: retención de la auditoría.
