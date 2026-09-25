#!/bin/sh
# Base para los tests de integración (stack/testing.md: Postgres real, base
# de pruebas que se limpia entre suites). Mismos roles y permisos que `nexo`.
# Idempotente: se puede correr a mano sobre un volumen ya creado.
set -eu

existe=$(psql -Atq --username "$POSTGRES_USER" --dbname postgres \
  -c "SELECT 1 FROM pg_database WHERE datname = 'nexo_pruebas'")
if [ "$existe" != "1" ]; then
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
    -c "CREATE DATABASE nexo_pruebas OWNER nexo_migrador"
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname nexo_pruebas <<'SQL'
ALTER SCHEMA public OWNER TO nexo_migrador;
REVOKE ALL ON DATABASE nexo_pruebas FROM PUBLIC;
GRANT CONNECT ON DATABASE nexo_pruebas TO nexo_app;
GRANT USAGE ON SCHEMA public TO nexo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE nexo_migrador IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO nexo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE nexo_migrador IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO nexo_app;
SQL
