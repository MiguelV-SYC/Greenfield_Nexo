# Infra local

`compose.yaml` levanta la infra de desarrollo: PostgreSQL 16 y MinIO.

```sh
cp .env.example .env                 # contraseñas locales
podman compose up -d                 # o: docker compose up -d
                                     # (o: python -m podman_compose up -d)
cp backend/.env.example backend/.env
cp backend/.env.pruebas.example backend/.env.pruebas.local
```

- **Puerto 5433**, no 5432: evita chocar con un PostgreSQL instalado en la
  máquina. Se cambia con `POSTGRES_PORT` en `.env`.
- **Bases**: `nexo` (desarrollo) y `nexo_pruebas` (tests de integración,
  se limpia entre suites). Roles `nexo_migrador` y `nexo_app` (ADR-0001).
- Los scripts de `infra/postgres/init/` solo corren al crear el volumen.
  `02-base-pruebas.sh` es idempotente y se puede correr a mano:
  `podman exec nexo_postgres_1 sh /docker-entrypoint-initdb.d/02-base-pruebas.sh`
  (en Git Bash, anteponer `MSYS_NO_PATHCONV=1`).

## Podman en Windows (WSL, rootful)

Con la máquina de Podman en modo *rootful*, los puertos publicados pueden no
llegar a `localhost` de Windows: se implementan con reglas nftables dentro de
la VM, no con un socket que el reenvío de WSL detecte. En ese caso, apuntar
los `.env` locales a la IP de la VM:

```sh
podman machine ssh -- "ip -4 -o addr show eth0"   # p. ej. 172.24.184.121
```

La IP puede cambiar al reiniciar Windows o WSL.

## MinIO (documentos legales)

- **Imagen**: `bitnamilegacy/minio:2025.7.23`. MinIO dejó de publicar imágenes
  oficiales (`minio/minio`, `quay.io/minio/minio` devuelven acceso denegado) y
  Bitnami movió las suyas a `bitnamilegacy`, sin actualizaciones de seguridad.
  Sirve para desarrollo local; el almacenamiento de los ambientes desplegados
  se decide con el deploy target (`repo-config.yaml > runtime`).
- `minio-preparar` corre `infra/minio/preparar.sh` (idempotente) al levantar:
  crea `nexo-documentos` y `nexo-documentos-pruebas` con versionado y Object
  Lock GOVERNANCE de 20 años (DEC-3, NFR5), y el usuario `nexo-app` con
  `politica-app.json`: puede cargar y leer, **no** borrar ni saltarse la
  retención (R7.8). Borrar una versión exige el usuario root y `--bypass`.
- Puertos 9000 (API S3) y 9001 (consola). Por eso SonarQube no usa el 9000.
- Podman copia el proxy del host a los contenedores; `minio-preparar` lo evita
  con `NO_PROXY=minio`. El backend (Node) no usa el proxy del entorno.
