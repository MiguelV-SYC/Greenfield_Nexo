-- Row-Level Security (ADR-0001, specs/organizaciones/design.md § Políticas RLS).
-- Las variables de sesión las fija BaseDatosTenant con set_config(..., true),
-- que solo viven dentro de la transacción. Sin ellas, nexo_app no ve nada.

CREATE FUNCTION app_usuario_id() RETURNS text
  LANGUAGE sql STABLE AS
  $$ SELECT nullif(current_setting('app.usuario_id', true), '') $$;

CREATE FUNCTION app_es_admin() RETURNS boolean
  LANGUAGE sql STABLE AS
  $$ SELECT coalesce(current_setting('app.es_admin', true), '') = 'true' $$;

-- Solo la organización que se está registrando en esta transacción (R4.2).
CREATE FUNCTION app_organizacion_nueva() RETURNS text
  LANGUAGE sql STABLE AS
  $$ SELECT nullif(current_setting('app.organizacion_nueva', true), '') $$;

-- Con permisos del invocador: la consulta a MiembroOrganizacion también pasa
-- por RLS, que solo deja ver las membresías del propio usuario.
CREATE FUNCTION app_es_miembro(organizacion uuid) RETURNS boolean
  LANGUAGE sql STABLE AS
  $$ SELECT EXISTS (
       SELECT 1 FROM "MiembroOrganizacion" m
       WHERE m."organizacionId" = organizacion AND m."usuarioId" = app_usuario_id()
     ) $$;

ALTER TABLE "Organizacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organizacion" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Sede" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sede" FORCE ROW LEVEL SECURITY;
ALTER TABLE "MiembroOrganizacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MiembroOrganizacion" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AuditoriaCambio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditoriaCambio" FORCE ROW LEVEL SECURITY;

-- Organizacion: miembros y Administrador leen y actualizan (R6.1, R6.2, R4.3).
-- Se inserta solo la organización que se está registrando; sin RETURNING,
-- porque la membresía se crea justo después.
CREATE POLICY organizacion_lectura ON "Organizacion" FOR SELECT
  USING (app_es_admin() OR app_es_miembro("id"));
CREATE POLICY organizacion_actualizacion ON "Organizacion" FOR UPDATE
  USING (app_es_admin() OR app_es_miembro("id"))
  WITH CHECK (app_es_admin() OR app_es_miembro("id"));
CREATE POLICY organizacion_registro ON "Organizacion" FOR INSERT
  WITH CHECK (app_usuario_id() IS NOT NULL AND "id"::text = app_organizacion_nueva());

-- Sede: el Administrador solo lee; los miembros leen y escriben (R4.6, R8.2).
CREATE POLICY sede_lectura ON "Sede" FOR SELECT
  USING (app_es_admin() OR app_es_miembro("organizacionId"));
CREATE POLICY sede_insercion ON "Sede" FOR INSERT
  WITH CHECK (app_es_miembro("organizacionId"));
CREATE POLICY sede_actualizacion ON "Sede" FOR UPDATE
  USING (app_es_miembro("organizacionId"))
  WITH CHECK (app_es_miembro("organizacionId"));
CREATE POLICY sede_borrado ON "Sede" FOR DELETE
  USING (app_es_miembro("organizacionId"));

-- MiembroOrganizacion: cada usuario ve sus membresías; el Administrador, todas.
-- Solo se crea la del Líder SST que registra (R4.2); accesos ampliará esto.
CREATE POLICY miembro_lectura ON "MiembroOrganizacion" FOR SELECT
  USING (app_es_admin() OR "usuarioId" = app_usuario_id());
CREATE POLICY miembro_registro ON "MiembroOrganizacion" FOR INSERT
  WITH CHECK (
    "usuarioId" = app_usuario_id()
    AND "rol" = 'LIDER_SST'
    AND "organizacionId"::text = app_organizacion_nueva()
  );

-- AuditoriaCambio: append-only (sin UPDATE/DELETE por grants, 0001).
CREATE POLICY auditoria_lectura ON "AuditoriaCambio" FOR SELECT
  USING (app_es_admin() OR app_es_miembro("organizacionId"));
CREATE POLICY auditoria_registro ON "AuditoriaCambio" FOR INSERT
  WITH CHECK (
    "usuarioId" = app_usuario_id()
    AND (app_es_admin() OR app_es_miembro("organizacionId"))
  );
