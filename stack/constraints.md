# Constraints

> **Servicio**: `nexo`
> **Estado**: completo (bootstrap 2026-09-25). Fuente: `CONTEXTO-NEXO.md` §2, §4, §5, §10 y §11.

> Lo que está **prohibido o desaconsejado** en este repo. Cada
> restricción tiene una razón concreta.

## Librerías / dependencias prohibidas

- **Otra librería de UI o de estilos** fuera de Tailwind 4 + V5 +
  shadcn (`base-mira`) + Hugeicons. El diseño aprobado depende de
  `nexo-design-kit`.
- **Otro motor de gráficas** que no sea Chart.js 4: el mockup aprobado
  se construyó con él.
- **Otro ORM o query builder** además de Prisma. Tener dos caminos a
  la base de datos rompe el filtro multi-tenant único.
- Una dependencia nueva requiere OK explícito (`AGENTS.md` §
  *Dependencias nuevas*).

## Patterns desaconsejados

- **`any` en TypeScript.** El modo estricto es obligatorio.
- **`console.log`.** Se usa nestjs-pino.
- **Funciones de más de 40 líneas.**
- **Lógica de negocio en el controller.**
- **Calcular indicadores en el frontend.** El frontend solo los
  muestra; el cálculo vive en el backend.
- **Consultar con Prisma las tablas de otro módulo.** Se usa el
  service que ese módulo exporta.
- **Filtrar por `organizacionId` a mano en un service.** El filtro va
  en un único guard/interceptor.
- **Tomar `organizacionId` del body o de la query.** Sale del token.
- **Endpoint sin documentación Swagger.**
- **Tragar excepciones en silencio.**

## Cosas que NO se deben hacer

- Escribir código en `backend/src/<modulo>/` sin `specs/<modulo>/`
  aprobado (SDD).
- Deshabilitar o saltar tests para que pase CI, o bajar la cobertura
  de 80 %.
- `git push --force` a `main`, `qa` o `pruebas`.
- `--no-verify` en commits.
- Commitear `.env` o cualquier secreto.
- Construir módulos fuera del alcance de v1 (comités, trabajadores,
  IPEVR, PESV, firma digital, notificaciones, asistente IA funcional)
  sin una spec propia.

## Restricciones de runtime / infra

- El modelo de datos **no debe impedir el PESV** (Resolución 40595 de
  2022), aunque esté fuera de v1.
- SonarQube local no puede usar el puerto 9000 (lo usa MinIO).
- Todo trabajo pesado (recálculo, exportaciones grandes) va a una cola
  BullMQ, no a una petición HTTP.

## Anti-patrones del methodology aplicados aquí

- **Improvisar lógica que no está en la spec.** Si la spec es ambigua,
  se detiene el trabajo y se pregunta.
- **Implementar sin pasar G2.** Kevin Arley es el revisor de negocio de
  los bolts.
