#!/bin/sh
# Prepara MinIO para Nexo (specs/organizaciones/design.md, DEC-3). Idempotente.
# - Buckets privados con versionado y Object Lock en modo GOVERNANCE, 20 años
#   (NFR5, R7.8). Object Lock solo se puede activar al crear el bucket.
# - Usuario de la aplicación con una política sin borrado ni bypass de la
#   retención: ni la aplicación puede borrar un documento o una versión.
#   Borrar exige al administrador de infraestructura (root) y --bypass.
set -eu

export MC_CONFIG_DIR=/tmp/mc
mc alias set nexo http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null

for bucket in $MINIO_BUCKETS; do
  mc mb --with-lock --ignore-existing "nexo/$bucket"
  mc retention set --default governance 20y "nexo/$bucket"
done

mc admin policy create nexo nexo-app /preparar/politica-app.json
mc admin user add nexo "$MINIO_APP_ACCESS_KEY" "$MINIO_APP_SECRET_KEY"
mc admin policy attach nexo nexo-app --user "$MINIO_APP_ACCESS_KEY" 2>/dev/null || true
echo "MinIO listo: $MINIO_BUCKETS"
