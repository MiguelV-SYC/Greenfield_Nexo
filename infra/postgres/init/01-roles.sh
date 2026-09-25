#!/bin/sh
# Roles de Nexo (ADR-0001, design.md de organizaciones):
# - nexo_migrador: dueño de la base y de las tablas; corre migraciones y
#   siembras. BYPASSRLS porque FORCE ROW LEVEL SECURITY también aplica al
#   dueño, y las migraciones de datos deben ver todas las filas.
# - nexo_app: rol de la aplicación; sin BYPASSRLS y sin ser dueño de nada,
#   así que las políticas RLS (FORCE) se le aplican siempre. Por defecto no
#   recibe DELETE: cada migración lo concede solo donde un R*.* lo permite.
# Corre una sola vez, al crear el volumen de datos.
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v migrador_pw="$NEXO_MIGRADOR_PASSWORD" -v app_pw="$NEXO_APP_PASSWORD" <<'SQL'
CREATE ROLE nexo_migrador LOGIN BYPASSRLS PASSWORD :'migrador_pw';
CREATE ROLE nexo_app LOGIN NOBYPASSRLS PASSWORD :'app_pw';

ALTER DATABASE nexo OWNER TO nexo_migrador;
ALTER SCHEMA public OWNER TO nexo_migrador;
REVOKE ALL ON DATABASE nexo FROM PUBLIC;
GRANT CONNECT ON DATABASE nexo TO nexo_app;
GRANT USAGE ON SCHEMA public TO nexo_app;

ALTER DEFAULT PRIVILEGES FOR ROLE nexo_migrador IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO nexo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE nexo_migrador IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO nexo_app;
SQL
